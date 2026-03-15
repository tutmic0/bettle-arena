'use client'

import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'

const MOCK_LEADERBOARD = [
  { rank: 1, wallet: '7xKp...3mNq', correct: 14, total: 15, points: 42, reward: 1071, claimed: false },
  { rank: 2, wallet: '3fRt...8kWz', correct: 13, total: 15, points: 39, reward: 770, claimed: false },
  { rank: 3, wallet: '9mBv...2pLx', correct: 13, total: 15, points: 38, reward: 556, claimed: true },
  { rank: 4, wallet: '1nQs...6jYc', correct: 12, total: 15, points: 35, reward: 428, claimed: false },
  { rank: 5, wallet: '5hDw...4tUa', correct: 11, total: 15, points: 32, reward: 342, claimed: false },
  { rank: 6, wallet: '2kFe...7rOi', correct: 11, total: 15, points: 31, reward: 299, claimed: true },
  { rank: 7, wallet: '8pJm...1sVb', correct: 10, total: 15, points: 28, reward: 257, claimed: false },
  { rank: 8, wallet: '4gNh...9wEf', correct: 10, total: 15, points: 27, reward: 214, claimed: false },
  { rank: 9, wallet: '6cTl...5yPd', correct: 9, total: 15, points: 24, reward: 171, claimed: true },
  { rank: 10, wallet: '0bXu...3zAk', correct: 9, total: 15, points: 23, reward: 171, claimed: false },
]

const RANK_COLORS: { [k: number]: string } = {
  1: '#C8A84B',
  2: '#9CA3AF',
  3: '#CD7F32',
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00C41C] animate-pulse" />
            <span className="text-[#00C41C] text-xs font-bold tracking-widest uppercase">Arena #001 — Live</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2">LEADER<span className="text-[#00C41C]">BOARD</span></h1>
          <p className="text-gray-500">Top 10 predictors share the reward pool</p>
        </div>

        {/* Reward pool */}
        <div className="bg-[#0A0A0A] border border-[#C8A84B]/30 rounded-xl p-6 mb-10 text-center">
          <div className="text-gray-500 text-sm mb-1">Total Reward Pool</div>
          <div className="text-[#C8A84B] font-black text-5xl mb-1">$4,280</div>
          <div className="text-gray-600 text-sm">Distributed after arena ends · 80% of trading fees</div>
        </div>

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
            const isFirst = entry.rank === 1
            return (
              <div
                key={entry.rank}
                className={`bg-[#0A0A0A] border rounded-xl p-5 text-center transition-all ${
                  isFirst
                    ? 'border-[#C8A84B]/50 shadow-[0_0_30px_rgba(200,168,75,0.15)]'
                    : 'border-[#00C41C]/20'
                }`}
              >
                <div className="text-3xl mb-2">
                  {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}
                </div>
                <div
                  className="font-black text-2xl mb-1"
                  style={{ color: RANK_COLORS[entry.rank] }}
                >
                  #{entry.rank}
                </div>
                <div className="text-white font-bold text-sm mb-1">{entry.wallet}</div>
                <div className="text-[#00C41C] font-black text-xl mb-1">{entry.points} pts</div>
                <div className="text-gray-500 text-xs">{entry.correct}/{entry.total} correct</div>
                <div className="text-[#C8A84B] font-bold text-sm mt-2">${entry.reward}</div>
              </div>
            )
          })}
        </div>

        {/* Full table */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
            <span>Rank</span>
            <span className="col-span-2">Wallet</span>
            <span className="text-center">Correct</span>
            <span className="text-center">Points</span>
            <span className="text-right">Reward</span>
          </div>

          {MOCK_LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className="grid grid-cols-6 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 hover:bg-[#111] transition-all items-center"
            >
              <span
                className="font-black text-lg"
                style={{ color: RANK_COLORS[entry.rank] || '#6B7280' }}
              >
                #{entry.rank}
              </span>

              <span className="col-span-2 text-white font-mono text-sm">{entry.wallet}</span>

              <span className="text-center">
                <span className="text-[#00C41C] font-black">{entry.correct}</span>
                <span className="text-gray-600">/{entry.total}</span>
              </span>

              <span className="text-center text-white font-black">{entry.points}</span>

              <span className="text-right">
                {entry.claimed ? (
                  <span className="text-gray-600 text-xs font-bold">CLAIMED</span>
                ) : (
                  <span className="text-[#C8A84B] font-black">${entry.reward}</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Arena ends */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">Arena ends and rewards distributed in</p>
          <p className="text-white font-black text-2xl mt-1">14:32:07</p>
        </div>

      </div>
    </main>
  )
}