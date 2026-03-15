import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateCoinScore } from '@/lib/scoring'
import { getTradeQuote } from '@/lib/bags'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dohvati aktivnu arenu sa aktivnim mečevima
    const { data: arena } = await supabaseAdmin
      .from('arenas')
      .select('*, matches(*)')
      .eq('status', 'active')
      .single()

    if (!arena) {
      return NextResponse.json({ message: 'No active arena' })
    }

    const activeMatches = arena.matches.filter(
      (m: any) => m.status === 'active'
    )

    // Za svaki meč izračunaj score oba coina
    for (const match of activeMatches) {
      const snapshotCount = await supabaseAdmin
        .from('snapshots')
        .select('id', { count: 'exact' })
        .eq('match_id', match.id)

      const snapshotNumber = Math.floor((snapshotCount.count || 0) / 2) + 1

      if (snapshotNumber > 4) continue

      // Dohvati početnu cijenu
      const [quoteA, quoteB] = await Promise.all([
        getTradeQuote(match.coin_a_mint),
        getTradeQuote(match.coin_b_mint),
      ])

      const startPriceA = quoteA?.price || 0
      const startPriceB = quoteB?.price || 0

      // Izračunaj score
      const [scoreA, scoreB] = await Promise.all([
        calculateCoinScore(match.coin_a_mint, startPriceA),
        calculateCoinScore(match.coin_b_mint, startPriceB),
      ])

      // Snimi snapshot
      await supabaseAdmin.from('snapshots').insert([
        {
          match_id: match.id,
          snapshot_number: snapshotNumber,
          coin_mint: match.coin_a_mint,
          unique_wallets: scoreA.uniqueWallets,
          buy_sell_ratio: scoreA.buySellRatio,
          price_performance: scoreA.pricePerformance,
          transaction_count: scoreA.transactionCount,
          holder_retention: scoreA.holderRetention,
          total_score: scoreA.totalScore,
        },
        {
          match_id: match.id,
          snapshot_number: snapshotNumber,
          coin_mint: match.coin_b_mint,
          unique_wallets: scoreB.uniqueWallets,
          buy_sell_ratio: scoreB.buySellRatio,
          price_performance: scoreB.pricePerformance,
          transaction_count: scoreB.transactionCount,
          holder_retention: scoreB.holderRetention,
          total_score: scoreB.totalScore,
        },
      ])

      // Update match score
      await supabaseAdmin
        .from('matches')
        .update({
          coin_a_score: scoreA.totalScore,
          coin_b_score: scoreB.totalScore,
        })
        .eq('id', match.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Snapshot failed' }, { status: 500 })
  }
}