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
      (m: any) => m.status === 'active' || m.status === 'pending'
    )

    if (activeMatches.length === 0) {
      return NextResponse.json({ message: 'No active matches' })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Za svaki meč izračunaj score oba coina
    for (const match of activeMatches) {
      try {
        const snapshotCountRes = await supabaseAdmin
          .from('snapshots')
          .select('id', { count: 'exact' })
          .eq('match_id', match.id)

        const snapshotNumber = Math.floor(((snapshotCountRes.count || 0) / 2) + 1)

        if (snapshotNumber > 4) {
          continue
        }

        // Dohvati početnu cijenu
        let startPriceA = 0
        let startPriceB = 0

        try {
          const quoteA = await getTradeQuote(match.coin_a_mint)
          startPriceA = quoteA?.price || 0
        } catch {
          console.error('Failed to get quote for', match.coin_a_mint)
        }

        try {
          const quoteB = await getTradeQuote(match.coin_b_mint)
          startPriceB = quoteB?.price || 0
        } catch {
          console.error('Failed to get quote for', match.coin_b_mint)
        }

        // Izračunaj score za oba coina
        let scoreA = { uniqueWallets: 0, buySellRatio: 0, pricePerformance: 0, transactionCount: 0, holderRetention: 0, totalScore: 0 }
        let scoreB = { uniqueWallets: 0, buySellRatio: 0, pricePerformance: 0, transactionCount: 0, holderRetention: 0, totalScore: 0 }

        try {
          scoreA = await calculateCoinScore(match.coin_a_mint, startPriceA)
        } catch {
          console.error('Failed to calculate score for', match.coin_a_mint)
        }

        try {
          scoreB = await calculateCoinScore(match.coin_b_mint, startPriceB)
        } catch {
          console.error('Failed to calculate score for', match.coin_b_mint)
        }

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

        // Update match score i status
        await supabaseAdmin
          .from('matches')
          .update({
            coin_a_score: scoreA.totalScore,
            coin_b_score: scoreB.totalScore,
            status: 'active',
          })
          .eq('id', match.id)

        successCount++
        results.push({
          match_id: match.id,
          snapshot: snapshotNumber,
          score_a: scoreA.totalScore,
          score_b: scoreB.totalScore,
        })

      } catch (matchError: any) {
        console.error('Match scoring failed:', match.id, matchError?.message)
        errorCount++
        continue
      }
    }

    return NextResponse.json({
      success: true,
      matches_processed: successCount,
      matches_failed: errorCount,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Snapshot failed' }, { status: 500 })
  }
}
