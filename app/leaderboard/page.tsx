'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'

interface LeaderboardEntry {
  wallet_address: string
  total_points: number
  correct_predictions: number
  total_predictions: number
  rank: number
  reward_amount: number
  reward_claimed: boolean
}

interface Round {
  id: string
  round_number: number
  status: string
  ends_at: string
}

function shortWallet(wallet: string) {
  return wallet.slice(0, 6) + '...' + wallet.slice(-4)
}

const RANK_COLORS: { [k: number]: string } = {
  1: '#C8A84B',
  2: '#9CA3AF',
  3: '#CD7F32',
}

export default function LeaderboardPage() {
  const { publicKey } = useWallet()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!round) return
    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(round.ends_at)
      const diff = end.getTime() - now.getTime()
      if (diff <= 0) { setTimeLeft('Round ended'); clearInterval(interval); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(h + 'h ' + m + 'm ' + s + 's')
    }, 1000)
    return () => clearInterval(interval)
  }, [round])

  async function fetchData() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [roundRes, lbRes] = await Promise.all([
        fetch('/api/round'),
        fetch('/api/leaderboard?date=' + today),
      ])
      const roundData = await roundRes.json()
      const lbData = await lbRes.json()
      setRound(roundData.round)
      setLeaderboard(lbData.leaderboard || [])
    } catch { } finally { setLoading(false) }
  }

  const myWallet = publicKey?.toString()
  const myEntry = leaderboard.find(e => e.wallet_address === myWallet)
  const DISTRIBUTION = [25, 18, 13, 10, 8, 7, 6, 5, 4, 4]

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-2 border-[#00C41C] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00C41C] animate-pulse" />
            <span className="text-[#00C41C] text-xs font-bold tracking-widest uppercase">Today's Leaderboard</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2">LEADER<span className="text-[#00C41C]">BOARD</span></h1>
          <p className="text-gray-500">Top 10 predictors share the daily reward pool</p>
        </div>

        {round && (
          <div className="bg-[#0A0A0A] border border-[#C8A84B]/30 rounded-xl p-6 mb-8 text-center">
            <div className="text-gray-500 text-sm mb-1">Current round ends in</div>
            <div className="text-white font-black text-3xl">{timeLeft || '...'}</div>
            <div className="text-gray-600 text-sm mt-1">Round {round.round_number} · Rewards at end of day</div>
          </div>
        )}

        {myEntry && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/30 rounded-xl p-4 mb-8">
            <div className="text-[#00C41C] text-xs font-bold uppercase tracking-wider mb-2">Your Position</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white font-black text-2xl">#{myEntry.rank}</span>
                <div>
                  <div className="text-white font-mono text-sm">{shortWallet(myEntry.wallet_address)}</div>
                  <div className="text-gray-500 text-xs">{myEntry.correct_predictions}/{myEntry.total_predictions} correct</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#00C41C] font-black text-xl">{myEntry.total_points} pts</div>
                {myEntry.rank <= 10 && (
                  <div className="text-[#C8A84B] text-sm font-bold">{DISTRIBUTION[myEntry.rank - 1]}% of pool</div>
                )}
              </div>
            </div>
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-black mb-2">No predictions yet today</h2>
            <p className="text-gray-500">Be the first to predict and claim the top spot!</p>
          </div>
        ) : (
          <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <span>Rank</span>
              <span className="col-span-2">Wallet</span>
              <span className="text-center">Points</span>
              <span className="text-right">Reward</span>
            </div>

            {leaderboard.map((entry) => (
              <div
                key={entry.wallet_address}
                className={'grid grid-cols-5 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center transition-all ' + (entry.wallet_address === myWallet ? 'bg-[#00C41C]/5' : 'hover:bg-[#111]')}
              >
                <span className="font-black text-lg" style={{ color: RANK_COLORS[entry.rank] || '#6B7280' }}>
                  #{entry.rank}
                </span>
                <span className="col-span-2 text-white font-mono text-sm">
                  {shortWallet(entry.wallet_address)}
                  {entry.wallet_address === myWallet && (
                    <span className="ml-2 text-[#00C41C] text-xs font-bold">YOU</span>
                  )}
                </span>
                <span className="text-center text-white font-black">{entry.total_points}</span>
                <span className="text-right">
                  {entry.rank <= 10 ? (
                    <span className="text-[#C8A84B] font-black">{DISTRIBUTION[entry.rank - 1]}%</span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}