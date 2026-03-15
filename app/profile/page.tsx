'use client'

import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const MOCK_HISTORY = [
  { arena: '#001', correct: 14, total: 15, points: 42, rank: 1, reward: 1071, claimed: false },
  { arena: '#002', correct: 11, total: 15, points: 31, rank: 4, reward: 428, claimed: true },
  { arena: '#003', correct: 13, total: 15, points: 38, rank: 2, reward: 770, claimed: true },
]

const MOCK_PREDICTIONS = [
  { match: 1, picked: 'DOGE2', opponent: 'PEPE', status: 'pending' },
  { match: 2, picked: 'MOON', opponent: 'SHIB2', status: 'pending' },
  { match: 3, picked: 'WOJAK', opponent: 'CHAD', status: 'pending' },
  { match: 4, picked: 'BONK2', opponent: 'FROG', status: 'pending' },
]

export default function ProfilePage() {
  const { connected, publicKey } = useWallet()

  if (!connected) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="text-6xl">⚔️</div>
          <h1 className="text-3xl font-black">Connect Your Wallet</h1>
          <p className="text-gray-500">Connect to view your profile and predictions</p>
          <WalletMultiButton style={{
            backgroundColor: '#00C41C',
            color: '#000000',
            fontWeight: '900',
            borderRadius: '8px',
            fontSize: '16px',
          }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        {/* Profile header */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#00C41C]/20 border-2 border-[#00C41C]/40 flex items-center justify-center text-3xl">
            ⚔️
          </div>
          <div className="flex-1">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Wallet</div>
            <div className="text-white font-mono text-lg font-bold mb-3">
              {publicKey?.toString().slice(0, 12)}...{publicKey?.toString().slice(-8)}
            </div>
            <div className="flex gap-4">
              <div className="bg-[#00C41C]/10 border border-[#00C41C]/30 rounded-lg px-4 py-2">
                <div className="text-gray-500 text-xs">$ARENA Balance</div>
                <div className="text-[#00C41C] font-black text-xl">5,000</div>
              </div>
              <div className="bg-[#C8A84B]/10 border border-[#C8A84B]/30 rounded-lg px-4 py-2">
                <div className="text-gray-500 text-xs">Status</div>
                <div className="text-[#C8A84B] font-black text-xl">ELIGIBLE ✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Arenas', value: '3' },
            { label: 'Avg Accuracy', value: '84%' },
            { label: 'Total Points', value: '111' },
            { label: 'Total Earned', value: '$2,269' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-5 text-center">
              <div className="text-[#00C41C] font-black text-3xl mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Current predictions */}
        <div className="mb-8">
          <h2 className="text-lg font-black tracking-widest uppercase mb-4 text-gray-400">
            Current Arena Predictions
          </h2>
          <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <span>Match</span>
              <span>Your Pick</span>
              <span>Opponent</span>
              <span className="text-right">Status</span>
            </div>
            {MOCK_PREDICTIONS.map((p) => (
              <div key={p.match} className="grid grid-cols-4 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center hover:bg-[#111] transition-all">
                <span className="text-gray-400 text-sm">Match #{p.match}</span>
                <span className="text-[#00C41C] font-black">{p.picked}</span>
                <span className="text-gray-500 text-sm">{p.opponent}</span>
                <span className="text-right text-yellow-500 text-xs font-bold uppercase">Pending</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arena history */}
        <div>
          <h2 className="text-lg font-black tracking-widest uppercase mb-4 text-gray-400">
            Arena History
          </h2>
          <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
              <span>Arena</span>
              <span className="text-center">Correct</span>
              <span className="text-center">Rank</span>
              <span className="text-center">Reward</span>
              <span className="text-right">Status</span>
            </div>
            {MOCK_HISTORY.map((h) => (
              <div key={h.arena} className="grid grid-cols-5 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center hover:bg-[#111] transition-all">
                <span className="text-white font-bold">Arena {h.arena}</span>
                <span className="text-center">
                  <span className="text-[#00C41C] font-black">{h.correct}</span>
                  <span className="text-gray-600">/{h.total}</span>
                </span>
                <span className="text-center text-[#C8A84B] font-black">#{h.rank}</span>
                <span className="text-center text-[#C8A84B] font-black">${h.reward}</span>
                <span className="text-right">
                  {h.claimed ? (
                    <span className="text-gray-600 text-xs font-bold">CLAIMED</span>
                  ) : (
                    <button className="bg-[#00C41C] text-black font-black text-xs px-4 py-2 rounded-lg hover:bg-[#00E620] transition-all">
                      CLAIM
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}