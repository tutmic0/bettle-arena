'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'

interface Coin {
  token_mint: string
  name: string
  symbol: string
  image_url?: string
}

interface Match {
  id: string
  round: 1 | 2 | 3 | 4
  coin_a_mint: string
  coin_b_mint: string
  coin_a_score: number
  coin_b_score: number
  status: string
  winner_mint?: string
}

interface Arena {
  id: string
  status: string
  starts_at: string
  ends_at: string
  prediction_closes_at: string
  arena_coins: Coin[]
  matches: Match[]
}

const POINTS_MAP: { [k: number]: number } = { 1: 1, 2: 2, 3: 3, 4: 5 }
const ROUND_LABELS: { [k: number]: string } = {
  1: 'Round 1 — 1 Point Each',
  2: 'Round 2 — 2 Points Each',
  3: 'Semi-Finals — 3 Points Each',
  4: 'Final — 5 Points',
}

function MatchCard({
  match,
  coins,
  predictions,
  onPredict,
  connected,
  submitted,
}: {
  match: Match
  coins: { [mint: string]: Coin }
  predictions: { [matchId: string]: string }
  onPredict: (matchId: string, mint: string) => void
  connected: boolean
  submitted: boolean
}) {
  const coinA = coins[match.coin_a_mint]
  const coinB = coins[match.coin_b_mint]
  const selected = predictions[match.id]
  const isCompleted = match.status === 'completed'

  return (
    <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-5 hover:border-[#00C41C]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 text-xs font-bold">MATCH</span>
        <span className="text-[#00C41C] text-xs font-bold bg-[#00C41C]/10 px-2 py-1 rounded-full">
          {POINTS_MAP[match.round]} {POINTS_MAP[match.round] === 1 ? 'POINT' : 'POINTS'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={!connected || submitted || isCompleted}
          onClick={() => onPredict(match.id, match.coin_a_mint)}
          className={`flex-1 bg-[#111] border-2 rounded-xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            selected === match.coin_a_mint
              ? 'border-[#00C41C] bg-[#00C41C]/10'
              : match.winner_mint === match.coin_a_mint
              ? 'border-[#C8A84B] bg-[#C8A84B]/10'
              : 'border-transparent hover:border-[#00C41C]/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#00C41C]/20 flex items-center justify-center mb-3 text-xs font-black text-[#00C41C]">
            {(coinA?.symbol || match.coin_a_mint.slice(0, 4)).slice(0, 2).toUpperCase()}
          </div>
          <div className="font-black text-white text-sm">{coinA?.symbol || match.coin_a_mint.slice(0, 8)}</div>
          <div className="text-gray-500 text-xs">{coinA?.name || 'Unknown'}</div>
          {isCompleted && (
            <div className="mt-2 text-xs font-bold">
              Score: <span className="text-[#00C41C]">{match.coin_a_score.toFixed(1)}</span>
            </div>
          )}
          {selected === match.coin_a_mint && !isCompleted && (
            <div className="mt-2 text-[#00C41C] text-xs font-bold">✓ SELECTED</div>
          )}
        </button>

        <div className="text-[#C8A84B] font-black text-lg shrink-0">VS</div>

        <button
          disabled={!connected || submitted || isCompleted}
          onClick={() => onPredict(match.id, match.coin_b_mint)}
          className={`flex-1 bg-[#111] border-2 rounded-xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            selected === match.coin_b_mint
              ? 'border-[#00C41C] bg-[#00C41C]/10'
              : match.winner_mint === match.coin_b_mint
              ? 'border-[#C8A84B] bg-[#C8A84B]/10'
              : 'border-transparent hover:border-[#00C41C]/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#00C41C]/20 flex items-center justify-center mb-3 text-xs font-black text-[#00C41C]">
            {(coinB?.symbol || match.coin_b_mint.slice(0, 4)).slice(0, 2).toUpperCase()}
          </div>
          <div className="font-black text-white text-sm">{coinB?.symbol || match.coin_b_mint.slice(0, 8)}</div>
          <div className="text-gray-500 text-xs">{coinB?.name || 'Unknown'}</div>
          {isCompleted && (
            <div className="mt-2 text-xs font-bold">
              Score: <span className="text-[#00C41C]">{match.coin_b_score.toFixed(1)}</span>
            </div>
          )}
          {selected === match.coin_b_mint && !isCompleted && (
            <div className="mt-2 text-[#00C41C] text-xs font-bold">✓ SELECTED</div>
          )}
        </button>
      </div>

      {!connected && (
        <p className="text-center text-gray-600 text-xs mt-3">Connect wallet to predict</p>
      )}
    </div>
  )
}

export default function ArenaPage() {
  const { connected, publicKey } = useWallet()
  const [arena, setArena] = useState<Arena | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArena()
  }, [])

  useEffect(() => {
    if (connected && publicKey && arena) {
      fetchExistingPredictions()
    }
  }, [connected, publicKey, arena])

  async function fetchArena() {
    try {
      const res = await fetch('/api/arena')
      const data = await res.json()
      setArena(data.arena)
    } catch (e) {
      setError('Failed to load arena')
    } finally {
      setLoading(false)
    }
  }

  async function fetchExistingPredictions() {
    if (!publicKey || !arena) return
    try {
      const res = await fetch(`/api/predictions?wallet=${publicKey.toString()}&arena_id=${arena.id}`)
      const data = await res.json()
      if (data.predictions && data.predictions.length > 0) {
        const map: { [matchId: string]: string } = {}
        data.predictions.forEach((p: any) => {
          map[p.match_id] = p.predicted_winner_mint
        })
        setPredictions(map)
        setSubmitted(true)
      }
    } catch (e) {
      console.error('Failed to fetch predictions')
    }
  }

  async function handleSubmit() {
    if (!publicKey || !arena) return
    setSubmitting(true)
    try {
      const predictionsArray = Object.entries(predictions).map(([match_id, predicted_winner_mint]) => ({
        match_id,
        predicted_winner_mint,
      }))

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          arena_id: arena.id,
          predictions: predictionsArray,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError('Failed to submit predictions')
      }
    } catch (e) {
      setError('Failed to submit predictions')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrediction = (matchId: string, mint: string) => {
    if (submitted) return
    setPredictions(prev => ({ ...prev, [matchId]: mint }))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#00C41C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading arena...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!arena) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-6xl">⚔️</div>
          <h1 className="text-3xl font-black">No Active Arena</h1>
          <p className="text-gray-500">Next arena starts at 21:00 UTC</p>
        </div>
      </main>
    )
  }

  const coinMap: { [mint: string]: Coin } = {}
  arena.arena_coins?.forEach((c) => { coinMap[c.token_mint] = c })

  const matchesByRound: { [round: number]: Match[] } = {}
  arena.matches?.forEach((m) => {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = []
    matchesByRound[m.round].push(m)
  })

  const totalMatches = arena.matches?.length || 0
  const totalPredicted = Object.keys(predictions).length
  const predictionOpen = new Date() < new Date(arena.prediction_closes_at)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-2 h-2 rounded-full ${predictionOpen ? 'bg-[#00C41C] animate-pulse' : 'bg-yellow-500'}`} />
              <span className={`text-xs font-bold tracking-widest uppercase ${predictionOpen ? 'text-[#00C41C]' : 'text-yellow-500'}`}>
                {predictionOpen ? 'Prediction Window Open' : 'Arena Live — Predictions Closed'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">BETTLE <span className="text-[#00C41C]">ARENA</span></h1>
            <p className="text-gray-500 mt-2">
              {predictionOpen
                ? `Predictions close at ${new Date(arena.prediction_closes_at).toUTCString()}`
                : `Arena ends at ${new Date(arena.ends_at).toUTCString()}`}
            </p>
          </div>
        </div>

        {submitted && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/40 rounded-xl p-4 mb-8 text-center">
            <span className="text-[#00C41C] font-black">✓ Predictions submitted! Good luck!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-8 text-center">
            <span className="text-red-400 font-bold">{error}</span>
          </div>
        )}

        {!submitted && predictionOpen && (
          <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-4 mb-10 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Your predictions: <span className="text-white font-black">{totalPredicted}/{totalMatches}</span></span>
            <div className="flex-1 mx-6 bg-[#111] rounded-full h-2">
              <div className="h-2 rounded-full bg-[#00C41C] transition-all" style={{ width: `${totalMatches > 0 ? (totalPredicted / totalMatches) * 100 : 0}%` }} />
            </div>
            <span className="text-[#00C41C] font-black text-sm">{totalMatches > 0 ? Math.round((totalPredicted / totalMatches) * 100) : 0}%</span>
          </div>
        )}

        {[1, 2, 3, 4].map((round) => {
          const matches = matchesByRound[round]
          if (!matches || matches.length === 0) return null
          return (
            <div key={round} className="mb-12">
              <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">
                {round === 1 ? '⚔️' : round === 2 ? '🏆' : round === 3 ? '🔥' : '👑'} {ROUND_LABELS[round]}
              </h2>
              <div className={`grid gap-4 ${round <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    coins={coinMap}
                    predictions={predictions}
                    onPredict={handlePrediction}
                    connected={connected}
                    submitted={submitted}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {connected && predictionOpen && !submitted && (
          <div className="text-center mt-10">
            <button
              onClick={handleSubmit}
              disabled={totalPredicted < totalMatches || submitting}
              className="bg-[#00C41C] text-black font-black px-16 py-5 rounded-xl text-xl hover:bg-[#00E620] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,196,28,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT PREDICTIONS ⚔️'}
            </button>
            <p className="text-gray-600 text-sm mt-3">
              {totalPredicted < totalMatches
                ? `Pick ${totalMatches - totalPredicted} more to submit`
                : 'All predictions ready — submit is final!'}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}