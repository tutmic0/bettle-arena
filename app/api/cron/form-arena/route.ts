import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBagsPools } from '@/lib/bags'
import { getTokenHolders, getTokenTransactions } from '@/lib/helius'
import { getTokenHolders, getTokenTransactions, getTokenMetadata } from '@/lib/helius'
export async function GET(req: NextRequest) {
  try {
    // Provjeri auth header
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dohvati sve pools sa bags.fm
    const pools = await getBagsPools()
    if (!pools || pools.length === 0) {
      return NextResponse.json({ error: 'No pools found' }, { status: 400 })
    }

    // Skoriraj svaki coin
    const scoredCoins = await Promise.allSettled(
      pools.slice(0, 50).map(async (pool: any) => {
        try {
          const [holders, transactions] = await Promise.all([
            getTokenHolders(pool.tokenMint),
            getTokenTransactions(pool.tokenMint),
          ])

          const uniqueWallets = holders?.total || 0
          const txCount = transactions?.length || 0
          const selectionScore = (uniqueWallets * 0.4) + (txCount * 0.4)

          const metadata = await getTokenMetadata(pool.tokenMint)
return {
  token_mint: pool.tokenMint,
  name: metadata?.name || pool.tokenMint.slice(0, 6),
  symbol: metadata?.symbol || pool.tokenMint.slice(0, 4).toUpperCase(),
  image_url: metadata?.image || null,
  selection_score: selectionScore,
  unique_wallets: uniqueWallets,
}
        } catch {
          return null
        }
      })
    )

    // Filtriraj null i uzmi top 16
    const validCoins = scoredCoins
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r: any) => r.value)
      .sort((a: any, b: any) => b.selection_score - a.selection_score)
      .slice(0, 16)

    // Ako nema dovoljno, uzmi minimum 8
    if (validCoins.length < 8) {
      return NextResponse.json({ error: 'Not enough eligible coins' }, { status: 400 })
    }

    // Kreiraj arenu
    const now = new Date()
    const startsAt = new Date(now)
    startsAt.setUTCHours(9, 0, 0, 0)
    startsAt.setUTCDate(startsAt.getUTCDate() + 1)

    const endsAt = new Date(startsAt)
    endsAt.setUTCDate(endsAt.getUTCDate() + 1)

    const predictionClosesAt = new Date(startsAt)

    const { data: arena, error: arenaError } = await supabaseAdmin
      .from('arenas')
      .insert({
        status: 'upcoming',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        prediction_closes_at: predictionClosesAt.toISOString(),
      })
      .select()
      .single()

    if (arenaError) {
      return NextResponse.json({ error: arenaError.message }, { status: 500 })
    }

    // Dodaj coinove u arenu
    const coinsToInsert = validCoins.map((coin: any) => ({
      arena_id: arena.id,
      token_mint: coin.token_mint,
      name: coin.name,
      symbol: coin.symbol,
      selection_score: coin.selection_score,
    }))

    await supabaseAdmin.from('arena_coins').insert(coinsToInsert)

    // Kreiraj mečeve za Round 1
    const matches = []
    for (let i = 0; i < validCoins.length; i += 2) {
      matches.push({
        arena_id: arena.id,
        round: 1,
        coin_a_mint: validCoins[i].token_mint,
        coin_b_mint: validCoins[i + 1].token_mint,
        status: 'pending',
      })
    }

    await supabaseAdmin.from('matches').insert(matches)

    return NextResponse.json({
      success: true,
      arena_id: arena.id,
      coins: validCoins.length,
      matches: matches.length,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}