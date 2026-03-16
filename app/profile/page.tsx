'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface Prediction {
  id: string
  match_id: string
  predicted_winner_mint: string
  actual_winner_mint: string | null
  is_correct: boolean | null
  points_earned: number
  created_at: string
}

interface LeaderboardEntry {
  date: string
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
  const [history, setHistory] = useState<LeaderboardEntry[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [eligible, setEligible] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) fetchData()
    else setLoading(false)
  }, [connected, publicKey])

  async function fetchData() {
    if (!publicKey) return
    try {
      const [eligRes, roundRes] = await Promise.all([
        fetch('/api/check-eligibility?wallet=' + publicKey.toString()),
        fetch('/api/round'),
      ])

      const eligData = await eligRes.json()
      setEligible(eligData.eligible)
      setBalance(eligData.balance || 0)

      const roundData = await roundRes.json()
      if (roundData.round) {
        const predRes = await fetch('/api/predictions?wallet=' + publicKey.toString() + '&round_id=' + roundData.round.id)
        const predData = await predRes.json()
        setPredictions(predData.predictions || [])
      }

      const today = new Date().toISOString().split('T')[0]
      const lbRes = await fetch('/api/leaderboard?date=' + today)
      const lbData = await lbRes.json()
      const myEntry = (lbData.leaderboard || []).find((e: any) => e.wallet_address === publicKey.toString())
      if (myEntry) setHistory([myEntry])

    } catch { } finally { setLoading(false) }
  }

  if (!connected) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="text-6xl">⚔️</div>
          <h1 className="text-3xl font-black">Connect Your Wallet</h1>
          <p className="text-gray-500">Connect to view your profile</p>
          <WalletMultiButton style={{ backgroundColor: '#00C41C', color: '#000', fontWeight: '900', borderRadius: '8px' }} />
        </div>
      </main>
    )
  }

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

  const totalCorrect = predictions.filter(p => p.is_correct === true).length
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#00C41C]/20 border-2 border-[#00C41C]/40 flex items-center justify-center text-3xl">⚔️</div>
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

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Predictions', value: predictions.length.toString() },
            { label: 'Correct', value: totalCorrect.toString() },
            { label: 'Points Today', value: totalPoints.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-5 text-center">
              <div className="text-[#00C41C] font-black text-3xl mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-black tracking-widest uppercase mb-4 text-gray-400">Current Round Predictions</h2>
          {predictions.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No predictions yet for this round.</p>
            </div>
          ) : (
            <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 px-6 py-3 border-b border-[#00C41C]/10 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <span>Your Pick</span>
                <span className="text-center">Status</span>
                <span className="text-right">Points</span>
              </div>
              {predictions.map((p) => (
                <div key={p.id} className="grid grid-cols-3 px-6 py-4 border-b border-[#00C41C]/10 last:border-0 items-center hover:bg-[#111] transition-all">
                  <span className="text-[#00C41C] font-mono text-xs">{p.predicted_winner_mint.slice(0, 12)}...</span>
                  <span className="text-center">
                    {p.is_correct === null ? (
                      <span className="text-yellow-500 text-xs font-bold">PENDING</span>
                    ) : p.is_correct ? (
                      <span className="text-[#00C41C] text-xs font-bold">CORRECT ✓</span>
                    ) : (
                      <span className="text-red-400 text-xs font-bold">WRONG ✗</span>
                    )}
                  </span>
                  <span className="text-right text-[#00C41C] font-black">{p.points_earned > 0 ? p.points_earned : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}