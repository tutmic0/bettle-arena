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

    // Dohvati active round
    const { data: round } = await supabaseAdmin
      .from('rounds')
      .select('*, round_matches(*)')
      .in('status', ['active', 'predicting'])
      .single()

    if (!round) {
      return NextResponse.json({ message: 'No active round' })
    }

    // Skoruj svaki meč
    for (const match of round.round_matches) {
      try {
        const [quoteA, quoteB] = await Promise.all([
          getTradeQuote(match.coin_a_mint).catch(() => null),
          getTradeQuote(match.coin_b_mint).catch(() => null),
        ])

        const [scoreA, scoreB] = await Promise.all([
          calculateCoinScore(match.coin_a_mint, quoteA?.price || 0).catch(() => ({ totalScore: 0 })),
          calculateCoinScore(match.coin_b_mint, quoteB?.price || 0).catch(() => ({ totalScore: 0 })),
        ])

        const winner = scoreA.totalScore >= scoreB.totalScore
          ? match.coin_a_mint
          : match.coin_b_mint

        await supabaseAdmin
          .from('round_matches')
          .update({
            coin_a_score: scoreA.totalScore,
            coin_b_score: scoreB.totalScore,
            winner_mint: winner,
            status: 'completed',
          })
          .eq('id', match.id)

        // Ažuriraj predikcije
        const { data: preds } = await supabaseAdmin
          .from('round_predictions')
          .select('*')
          .eq('match_id', match.id)

        for (const pred of preds || []) {
          const isCorrect = pred.predicted_winner_mint === winner
          await supabaseAdmin
            .from('round_predictions')
            .update({
              actual_winner_mint: winner,
              is_correct: isCorrect,
              points_earned: isCorrect ? 1 : 0,
            })
            .eq('id', pred.id)
        }
      } catch (e) {
        console.error('Match failed:', match.id)
        continue
      }
    }

    // Finaliziraj round
    await supabaseAdmin
      .from('rounds')
      .update({ status: 'completed' })
      .eq('id', round.id)

    // Ažuriraj daily leaderboard
    const today = new Date().toISOString().split('T')[0]
    const { data: allPreds } = await supabaseAdmin
      .from('round_predictions')
      .select('*')
      .eq('round_id', round.id)

    const walletMap: { [w: string]: any } = {}
    for (const pred of allPreds || []) {
      if (!walletMap[pred.wallet_address]) {
        walletMap[pred.wallet_address] = {
          wallet_address: pred.wallet_address,
          date: today,
          total_points: 0,
          correct_predictions: 0,
          total_predictions: 0,
        }
      }
      walletMap[pred.wallet_address].total_predictions++
      if (pred.is_correct) {
        walletMap[pred.wallet_address].total_points++
        walletMap[pred.wallet_address].correct_predictions++
      }
    }

    // Upsert leaderboard
    for (const entry of Object.values(walletMap)) {
      await supabaseAdmin
        .from('daily_leaderboard')
        .upsert(entry, { onConflict: 'date,wallet_address' })
    }

    // Rankiraj
    const { data: lb } = await supabaseAdmin
      .from('daily_leaderboard')
      .select('*')
      .eq('date', today)
      .order('total_points', { ascending: false })

    const DISTRIBUTION = [0.25, 0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.04]
    for (let i = 0; i < (lb || []).length; i++) {
      await supabaseAdmin
        .from('daily_leaderboard')
        .update({
          rank: i + 1,
          reward_amount: i < 10 ? DISTRIBUTION[i] : 0,
        })
        .eq('id', lb![i].id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
