'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface Coin {
  token_mint: string
  name: string
  symbol: string
  image_url?: string
}

interface Prediction {
  id: string
  match_id: string
  arena_id: string
  predicted_winner_mint: string
  actual_winner_mint: string | null
  is_correct: boolean | null
  points_earned: number
  created_at: string
  matches?: {
    round: number
    coin_a_mint: string
    coin_b_mint: string
    winner_mint: string | null
    status: string
  }
}

interface LeaderboardEntry {
  arena_id: string
  total_points: number
  correct_predictions: number
  total_predictions: number
  rank: number
  reward_amount: number
  reward_claimed: boolean
}

export default function ProfilePage() {
  const { connected, publicKey } = useWallet()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [coinMap, setCoinMap] = useState<{ [mint: string]: Coin }>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [eligible, setEligible] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchProfileData()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  async function fetchProfileData() {
    if (!publicKey) return
    try {
      const [arenaRes, eligRes] = await Promise.all([
        fetch('/api/arena'),
        fetch('/api/check-eligibility?wallet=' + publicKey.toString()),
      ])

      const arenaData = await arenaRes.json()
      const eligData = await eligRes.json()

      setEligible(eligData.eligible)
      setBalance(eligData.balance || 0)

      if (arenaData.arena) {
        const profileRes = await fetch('/api/profile?wallet=' + publicKey.toString() + '&arena_id=' + arenaData.arena.id)
        const profileData = await profileRes.json()
        setPredictions(profileData.predictions || [])
        setCoinMap(profileData.coinMap || {})
      }

      const lbRes = await fetch('/api/leaderboard?wallet=' + publicKey.toString())
      const lbData = await lbRes.json()
      setLeaderboard(lbData.leaderboard || [])

    } catch (e) {
      console.error('Failed to fetch profile data')
    } finally {
      setLoading(false)
    }
  }

  async function handleClaim(arena_id: string) {
    if (!publicKey) return
    setClaiming(arena_id)
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          arena_id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Reward claimed successfully!')
        fetchProfileData()
      } else {
        alert('Claim failed: ' + data.error)
      }
    } catch {
      alert('Claim failed')
    } finally {
      setClaiming(null)
    }
  }

  if (!connected) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="text-6xl">⚔️</div>
          <h1 className="text-3xl font-black">Connect Your Wallet</h1>
          <p className="text-gray-500">Connect to view your profile and predictions</p>
          <WalletMultiButton style={{ backgroundColor: '#00C41C', color: '#000000', fontWeight: '900', borderRadius: '8px', fontSize: '16px' }} />
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#00C41C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </main>
    )
  }

  const totalCorrect = predictions.filter(p => p.is_correct === true).length
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0)
  const accuracy = predictions.length > 0 ? Math.round((totalCorrect / predictions.length) * 100) : 0

  const ROUND_LABELS: { [k: number]: string } = { 1: 'R1', 2: 'R2', 3: 'SF', 4: 'F' }
  const POINTS_MAP: { [k: number]: number } = { 1: 1, 2: 2, 3: 3, 4: 5 }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#00C41C]/20 border-2 border-[#00C41C]/40 flex items-center justify-center text-3xl">
            ⚔️
          </div>
          <div className="flex-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Wallet</div>
            <div className="text-white font-mono text-lg font-bold mb-3">
              {publicKey?.toString().slice(0, 12)}...{publicKey?.toString().slice(-8)}
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-[#00C41C]/10 border border-[#00C41C]/30 rounded-lg px-4 py-2">
                <div className="text-gray-500 text-xs">$ARENA Balance</div>
                <div className="text-[#00C41C] font-black text-xl">{balance.toLocaleString()}</div>
              </div>
              <div className={'border rounded-lg px-4 py-2 ' + (eligible ? 'bg-[#C8A84B]/10 border-[#C8A84B]/30' : 'bg-red-500/10 border-red-500/30')}>
                <div className="text-gray-500 text-xs">Status</div>
                <div className={'font-black text-xl ' + (eligible ? 'text-[#C8A84B]' : 'text-red-400')}>
                  {eligible ? 'ELIGIBLE ✓' : 'NOT ELIGIBLE'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Predictions', value: predictions.length.toString() },
            { label: 'Correct', value: totalCorrect.toString() },
            { label: 'Accuracy', value: accuracy + '%' },
            { label: 'Points', value: totalPoints.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-5 text-center">
              <div className="text-[#00C41C] font-black text-3xl mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-black tracking-widest uppercase mb-4 text-gray-400">
            Current Arena Predictions
          </h2>
          {predictions.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No predictions yet for this arena.</p>
            </div>
          ) : (
            <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <span>Round</span>
                <span>Your Pick</span>
                <span>Opponent</span>
                <span className="text-center">Status</span>
                <span className="text-right">Points</span>
              </div>
              {predictions.map((p) => {
                const match = p.matches
                const pickedCoin = coinMap[p.predicted_winner_mint]
                const opponentMint = match
                  ? (p.predicted_winner_mint === match.coin_a_mint ? match.coin_b_mint : match.coin_a_mint)
                  : null
                const opponentCoin = opponentMint ? coinMap[opponentMint] : null
                const round = match?.round || 1

                return (
                  <div key={p.id} className="grid grid-cols-5 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center hover:bg-[#111] transition-all">
                    <span className="text-gray-400 text-xs font-bold">
                      {ROUND_LABELS[round]} <span className="text-gray-600">({POINTS_MAP[round]}pt)</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {pickedCoin?.image_url && (
                        <img src={pickedCoin.image_url} alt={pickedCoin.symbol} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <span className="text-[#00C41C] font-black text-sm">{pickedCoin?.symbol || p.predicted_winner_mint.slice(0, 6)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {opponentCoin?.image_url && (
                        <img src={opponentCoin.image_url} alt={opponentCoin.symbol} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <span className="text-gray-400 text-sm">{opponentCoin?.symbol || (opponentMint ? opponentMint.slice(0, 6) : '?')}</span>
                    </span>
                    <span className="text-center">
                      {p.is_correct === null ? (
                        <span className="text-yellow-500 text-xs font-bold">PENDING</span>
                      ) : p.is_correct ? (
                        <span className="text-[#00C41C] text-xs font-bold">CORRECT ✓</span>
                      ) : (
                        <span className="text-red-400 text-xs font-bold">WRONG ✗</span>
                      )}
                    </span>
                    <span className="text-right text-[#00C41C] font-black">
                      {p.points_earned > 0 ? p.points_earned : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {leaderboard.length > 0 && (
          <div>
            <h2 className="text-lg font-black tracking-widest uppercase mb-4 text-gray-400">
              Arena History
            </h2>
            <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <span>Correct</span>
                <span className="text-center">Rank</span>
                <span className="text-center">Points</span>
                <span className="text-right">Reward</span>
              </div>
              {leaderboard.map((entry, i) => (
                <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center hover:bg-[#111] transition-all">
                  <span>
                    <span className="text-[#00C41C] font-black">{entry.correct_predictions}</span>
                    <span className="text-gray-600">/{entry.total_predictions}</span>
                  </span>
                  <span className="text-center text-[#C8A84B] font-black">#{entry.rank}</span>
                  <span className="text-center text-white font-black">{entry.total_points}</span>
                  <span className="text-right">
                    {entry.reward_claimed ? (
                      <span className="text-gray-600 text-xs font-bold">CLAIMED</span>
                    ) : entry.reward_amount > 0 ? (
                      <button
                        onClick={() => handleClaim(entry.arena_id)}
                        disabled={claiming === entry.arena_id}
                        className="bg-[#00C41C] text-black font-black text-xs px-4 py-2 rounded-lg hover:bg-[#00E620] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claiming === entry.arena_id ? 'CLAIMING...' : 'CLAIM'}
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
