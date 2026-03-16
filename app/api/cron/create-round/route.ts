import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBagsPools } from '@/lib/bags'
import { getTokenMetadata } from '@/lib/helius'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dohvati 20 coinova sa Bags.fm
    const pools = await getBagsPools()
    if (!pools || pools.length === 0) {
      return NextResponse.json({ error: 'No pools found' }, { status: 400 })
    }

    // Uzmi prvih 20
    const selectedPools = pools.slice(0, 20)

    // Dohvati metadata za svaki coin
    const coins = await Promise.all(
      selectedPools.map(async (pool: any) => {
        try {
          const metadata = await getTokenMetadata(pool.tokenMint)
          return {
            token_mint: pool.tokenMint,
            name: metadata?.name || pool.tokenMint.slice(0, 6),
            symbol: metadata?.symbol || pool.tokenMint.slice(0, 4).toUpperCase(),
            image_url: metadata?.image || null,
          }
        } catch {
          return {
            token_mint: pool.tokenMint,
            name: pool.tokenMint.slice(0, 6),
            symbol: pool.tokenMint.slice(0, 4).toUpperCase(),
            image_url: null,
          }
        }
      })
    )

    // Kreiraj round
    const now = new Date()
    const predictionOpensAt = new Date(now)
    const predictionClosesAt = new Date(now.getTime() + 60 * 60 * 1000) // +1 sat
    const endsAt = new Date(now.getTime() + 4 * 60 * 60 * 1000) // +4 sata

    // Dohvati broj rundi danas
    const today = now.toISOString().split('T')[0]
    const { count } = await supabaseAdmin
      .from('rounds')
      .select('id', { count: 'exact' })
      .eq('date', today)

    const { data: round, error: roundError } = await supabaseAdmin
      .from('rounds')
      .insert({
        date: today,
        round_number: (count || 0) + 1,
        status: 'predicting',
        prediction_opens_at: predictionOpensAt.toISOString(),
        prediction_closes_at: predictionClosesAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single()

    if (roundError) {
      return NextResponse.json({ error: roundError.message }, { status: 500 })
    }

    // Spremi coinove
    await supabaseAdmin.from('round_coins').insert(
      coins.map(c => ({ ...c, round_id: round.id }))
    )

    // Kreiraj 10 mečeva (parovi coinova)
    const matches = []
    for (let i = 0; i < 20; i += 2) {
      matches.push({
        round_id: round.id,
        coin_a_mint: coins[i].token_mint,
        coin_b_mint: coins[i + 1].token_mint,
        status: 'pending',
      })
    }

    await supabaseAdmin.from('round_matches').insert(matches)

    return NextResponse.json({
      success: true,
      round_id: round.id,
      round_number: round.round_number,
      coins: coins.length,
      matches: matches.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}