import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Odredi pobjednike svih mečeva
    for (const match of arena.matches) {
      if (match.status === 'completed') continue

      const winner =
        match.coin_a_score >= match.coin_b_score
          ? match.coin_a_mint
          : match.coin_b_mint

      await supabaseAdmin
        .from('matches')
        .update({ winner_mint: winner, status: 'completed' })
        .eq('id', match.id)
    }

    // Ažuriraj predikcije — is_correct
    const { data: matches } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('arena_id', arena.id)

    for (const match of matches || []) {
      const { data: predictions } = await supabaseAdmin
        .from('predictions')
        .select('*')
        .eq('match_id', match.id)

      for (const pred of predictions || []) {
        const isCorrect = pred.predicted_winner_mint === match.winner_mint
        const points = isCorrect
          ? match.round === 1 ? 1
          : match.round === 2 ? 2
          : match.round === 3 ? 3
          : 5
          : 0

        await supabaseAdmin
          .from('predictions')
          .update({
            actual_winner_mint: match.winner_mint,
            is_correct: isCorrect,
            points_earned: points,
          })
          .eq('id', pred.id)
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
        walletMap[pred.wallet_address].total_points += pred.points_earned
        walletMap[pred.wallet_address].correct_predictions++
        if (!walletMap[pred.wallet_address].first_correct_at) {
          walletMap[pred.wallet_address].first_correct_at = pred.created_at
        }
      }
    }

    // Rankiraj i dodaj reward
    const REWARD_POOL = 0.8
    const DISTRIBUTION = [0.25, 0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.04]

    const sorted = Object.values(walletMap)
      .sort((a: any, b: any) => {
        if (b.total_points !== a.total_points) return b.total_points - a.total_points
        return new Date(a.first_correct_at).getTime() - new Date(b.first_correct_at).getTime()
      })

    for (let i = 0; i < sorted.length; i++) {
      const entry: any = sorted[i]
      entry.rank = i + 1
      entry.reward_amount = i < 10 ? DISTRIBUTION[i] : 0

      await supabaseAdmin
        .from('leaderboard')
        .upsert(entry, { onConflict: 'arena_id,wallet_address' })
    }

    // Finaliziraj arenu
    await supabaseAdmin
      .from('arenas')
      .update({ status: 'completed' })
      .eq('id', arena.id)

    // Aktiviraj sljedeću arenu
    await supabaseAdmin
      .from('arenas')
      .update({ status: 'active' })
      .eq('status', 'upcoming')
      .order('starts_at', { ascending: true })
      .limit(1)

    return NextResponse.json({ success: true, arena_id: arena.id })
  } catch (error) {
    return NextResponse.json({ error: 'Finalize failed' }, { status: 500 })
  }
}