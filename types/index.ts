export type ArenaStatus = 'upcoming' | 'active' | 'completed'
export type MatchStatus = 'pending' | 'active' | 'completed'

export interface Arena {
  id: string
  status: ArenaStatus
  created_at: string
  starts_at: string
  ends_at: string
  prediction_closes_at: string
}

export interface ArenaCoin {
  id: string
  arena_id: string
  token_mint: string
  name: string
  symbol: string
  image_url: string
  selection_score: number
}

export interface Match {
  id: string
  arena_id: string
  round: 1 | 2 | 3 | 4
  coin_a_mint: string
  coin_b_mint: string
  winner_mint: string | null
  coin_a_score: number
  coin_b_score: number
  status: MatchStatus
}

export interface Snapshot {
  id: string
  match_id: string
  snapshot_number: 1 | 2 | 3 | 4
  coin_mint: string
  unique_wallets: number
  buy_sell_ratio: number
  price_performance: number
  transaction_count: number
  holder_retention: number
  total_score: number
}

export interface Prediction {
  id: string
  arena_id: string
  match_id: string
  wallet_address: string
  predicted_winner_mint: string
  actual_winner_mint: string | null
  is_correct: boolean | null
  points_earned: number
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  arena_id: string
  wallet_address: string
  total_points: number
  correct_predictions: number
  total_predictions: number
  rank: number
  reward_amount: number
  reward_claimed: boolean
  first_correct_at: string | null
}