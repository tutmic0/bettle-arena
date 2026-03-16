import { supabaseAdmin } from './supabase'

export async function getCurrentRound() {
  const { data } = await supabaseAdmin
    .from('rounds')
    .select('*, round_matches(*), round_coins(*)')
    .in('status', ['predicting', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getUpcomingRound() {
  const { data } = await supabaseAdmin
    .from('rounds')
    .select('*, round_matches(*), round_coins(*)')
    .eq('status', 'upcoming')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getDailyLeaderboard(date: string) {
  const { data } = await supabaseAdmin
    .from('daily_leaderboard')
    .select('*')
    .eq('date', date)
    .order('rank', { ascending: true })
    .limit(10)
  return data
}