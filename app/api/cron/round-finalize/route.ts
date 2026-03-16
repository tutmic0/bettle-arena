import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const POINTS_MAP: { [k: number]: number } = { 1: 1, 2: 2, 3: 3, 4: 5 }

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dohvati aktivnu arenu
    const { data: arena } = await supabaseAdmin
      .from('arenas')
      .select('*, matches(*)')
      .eq('status', 'active')
      .single()

    if (!arena) {
      return NextResponse.json({ message: 'No active arena' })
    }

    const results = {
      rounds_processed: [] as number[],
      winners_set: 0,
      predictions_updated: 0,
    }

    // Provjeri svaku rundu
    for (const round of [1, 2, 3, 4]) {
      const roundMatches = arena.matches.filter((m: any) => m.round === round)
      if (roundMatches.length === 0) continue

      // Provjeri da li svi mečevi u rundi imaju dovoljno snapshota
      // R1 — nakon 1 snapshota možemo proglasiti pobjednike
      // R2 — nakon 2 snapshota
      // SF — nakon 3 snapshota  
      // Final — nakon 4 snapshota (cijela arena završena)
      const requiredSnapshots = round

      for (const match of roundMatches) {
        // Preskoči ako već ima pobjednika
        if (match.winner_mint) continue

        // Preskoči TBD mečeve
        if (match.coin_a_mint.startsWith('TBD') || match.coin_b_mint.startsWith('TBD')) continue

        // Provjeri koliko snapshota ima ovaj meč
        const { count } = await supabaseAdmin
          .from('snapshots')
          .select('id', { count: 'exact' })
          .eq('match_id', match.id)

        const snapshotCount = Math.floor((count || 0) / 2)

        if (snapshotCount < requiredSnapshots) continue

        // Odredi pobjednika na osnovu prosječnog scorea
        const winner = match.coin_a_score >= match.coin_b_score
          ? match.coin_a_mint
          : match.coin_b_mint

        // Postavi pobjednika
        await supabaseAdmin
          .from('matches')
          .update({
            winner_mint: winner,
            status: 'completed',
          })
          .eq('id', match.id)

        results.winners_set++

        // Ažuriraj predictions za ovaj meč
        const { data: matchPredictions } = await supabaseAdmin
          .from('predictions')
          .select('*')
          .eq('match_id', match.id)

        for (const pred of matchPredictions || []) {
          const isCorrect = pred.predicted_winner_mint === winner
          const points = isCorrect ? POINTS_MAP[round] : 0

          await supabaseAdmin
            .from('predictions')
            .update({
              actual_winner_mint: winner,
              is_correct: isCorrect,
              points_earned: points,
            })
            .eq('id', pred.id)

          results.predictions_updated++
        }
      }

      results.rounds_processed.push(round)
    }

    // Ažuriraj leaderboard
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

    // Rankiraj
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

    return NextResponse.json({
      success: true,
      ...results,
      leaderboard_updated: sorted.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Round finalize failed' }, { status: 500 })
  }
}
