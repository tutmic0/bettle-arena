import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const POINTS_MAP: { [k: number]: number } = { 1: 1, 2: 2, 3: 3, 4: 5 }

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: arena } = await supabaseAdmin
      .from('arenas')
      .select('*, matches(*)')
      .eq('status', 'active')
      .single()

    if (!arena) {
      return NextResponse.json({ message: 'No active arena' })
    }

    const results = { winners_set: 0, predictions_updated: 0, r2_updated: 0, sf_updated: 0 }

    // Refresh matches after each update
    async function getMatches() {
      const { data } = await supabaseAdmin
        .from('matches')
        .select('*')
        .eq('arena_id', arena.id)
        .order('created_at', { ascending: true })
      return data || []
    }

    let matches = await getMatches()

    for (const round of [1, 2, 3, 4]) {
      const roundMatches = matches.filter((m: any) => m.round === round)
      if (roundMatches.length === 0) continue

      for (const match of roundMatches) {
        if (match.winner_mint) continue
        if (match.coin_a_mint.startsWith('TBD') || match.coin_b_mint.startsWith('TBD')) continue

        const { count } = await supabaseAdmin
          .from('snapshots')
          .select('id', { count: 'exact' })
          .eq('match_id', match.id)

        if ((count || 0) < 2) continue

        const winner = match.coin_a_score >= match.coin_b_score
          ? match.coin_a_mint
          : match.coin_b_mint

        await supabaseAdmin
          .from('matches')
          .update({ winner_mint: winner, status: 'completed' })
          .eq('id', match.id)

        results.winners_set++

        const { data: preds } = await supabaseAdmin
          .from('predictions')
          .select('*')
          .eq('match_id', match.id)

        for (const pred of preds || []) {
          const isCorrect = pred.predicted_winner_mint === winner
          await supabaseAdmin
            .from('predictions')
            .update({
              actual_winner_mint: winner,
              is_correct: isCorrect,
              points_earned: isCorrect ? POINTS_MAP[round] : 0,
            })
            .eq('id', pred.id)
          results.predictions_updated++
        }
      }

      // Refresh matches after processing round
      matches = await getMatches()

      // After R1 — populate R2
      if (round === 1) {
        const r1 = matches.filter((m: any) => m.round === 1)
        const r2 = matches.filter((m: any) => m.round === 2)
        for (let i = 0; i < r2.length; i++) {
          const m1 = r1[i * 2]
          const m2 = r1[i * 2 + 1]
          if (!m1?.winner_mint || !m2?.winner_mint) continue
          if (r2[i].coin_a_mint.startsWith('TBD')) {
            await supabaseAdmin.from('matches').update({
              coin_a_mint: m1.winner_mint,
              coin_b_mint: m2.winner_mint,
            }).eq('id', r2[i].id)
            results.r2_updated++
          }
        }
        matches = await getMatches()
      }

      // After R2 — populate SF
      if (round === 2) {
        const r2 = matches.filter((m: any) => m.round === 2)
        const sf = matches.filter((m: any) => m.round === 3)
        for (let i = 0; i < sf.length; i++) {
          const m1 = r2[i * 2]
          const m2 = r2[i * 2 + 1]
          if (!m1?.winner_mint || !m2?.winner_mint) continue
          if (sf[i].coin_a_mint.startsWith('TBD')) {
            await supabaseAdmin.from('matches').update({
              coin_a_mint: m1.winner_mint,
              coin_b_mint: m2.winner_mint,
            }).eq('id', sf[i].id)
            results.sf_updated++
          }
        }
        matches = await getMatches()
      }

      // After SF — populate Final
      if (round === 3) {
        const sf = matches.filter((m: any) => m.round === 3)
        const final = matches.find((m: any) => m.round === 4)
        if (final && sf[0]?.winner_mint && sf[1]?.winner_mint && final.coin_a_mint.startsWith('TBD')) {
          await supabaseAdmin.from('matches').update({
            coin_a_mint: sf[0].winner_mint,
            coin_b_mint: sf[1].winner_mint,
          }).eq('id', final.id)
        }
        matches = await getMatches()
      }
    }

    // Update leaderboard
    const { data: allPredictions } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('arena_id', arena.id)

    const walletMap: { [wallet: string]: any } = {}
    for (const pred of allPredictions || []) {
      if (!walletMap[pred.wallet_address]) {
        walletMap[pred.wallet_address] = {
          wallet_address: pred.wallet_address,
          arena_id: arena.id,
          total_points: 0,
          correct_predictions: 0,
          total_predictions: 0,
          first_correct_at: null,
        }
      }
      walletMap[pred.wallet_address].total_predictions++
      if (pred.is_correct) {
        walletMap[pred.wallet_address].total_points += pred.points_earned || 0
        walletMap[pred.wallet_address].correct_predictions++
        if (!walletMap[pred.wallet_address].first_correct_at) {
          walletMap[pred.wallet_address].first_correct_at = pred.created_at
        }
      }
    }

    const DISTRIBUTION = [0.25, 0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.04]
    const sorted = Object.values(walletMap).sort((a: any, b: any) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points
      if (a.first_correct_at && b.first_correct_at) {
        return new Date(a.first_correct_at).getTime() - new Date(b.first_correct_at).getTime()
      }
      return 0
    })

    for (let i = 0; i < sorted.length; i++) {
      const entry: any = sorted[i]
      entry.rank = i + 1
      entry.reward_amount = i < 10 ? DISTRIBUTION[i] : 0
      await supabaseAdmin
        .from('leaderboard')
        .upsert(entry, { onConflict: 'arena_id,wallet_address' })
    }

    return NextResponse.json({ success: true, ...results, leaderboard_entries: sorted.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
