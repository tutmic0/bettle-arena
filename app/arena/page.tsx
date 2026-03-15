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

function CoinAvatar({ coin, mint }: { coin?: Coin; mint: string }) {
  const symbol = coin?.symbol || mint.slice(0, 4).toUpperCase()
  const initials = symbol.slice(0, 2).toUpperCase()

  if (coin?.image_url) {
    return (
      <img
        src={coin.image_url}
        alt={symbol}
        width={40}
        height={40}
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = '<div style="width:40px;height:40px;border-radius:50%;background:rgba(0,196,28,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#00C41C">' + initials + '</div>'
          }
        }}
      />
    )
  }

  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,196,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#00C41C' }}>
      {initials}
    </div>
  )
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
  const points = POINTS_MAP[match.round]

  const borderA = selected === match.coin_a_mint
    ? '2px solid #00C41C'
    : match.winner_mint === match.coin_a_mint
    ? '2px solid #C8A84B'
    : '2px solid transparent'

  const borderB = selected === match.coin_b_mint
    ? '2px solid #00C41C'
    : match.winner_mint === match.coin_b_mint
    ? '2px solid #C8A84B'
    : '2px solid transparent'

  const bgA = selected === match.coin_a_mint ? 'rgba(0,196,28,0.1)' : match.winner_mint === match.coin_a_mint ? 'rgba(200,168,75,0.1)' : '#111'
  const bgB = selected === match.coin_b_mint ? 'rgba(0,196,28,0.1)' : match.winner_mint === match.coin_b_mint ? 'rgba(200,168,75,0.1)' : '#111'

  return (
    <div style={{ background: '#0A0A0A', border: '1px solid rgba(0,196,28,0.2)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 700 }}>MATCH</span>
        <span style={{ color: '#00C41C', fontSize: 11, fontWeight: 700, background: 'rgba(0,196,28,0.1)', padding: '3px 8px', borderRadius: 20 }}>
          {points} {points === 1 ? 'POINT' : 'POINTS'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          disabled={!connected || submitted || isCompleted}
          onClick={() => onPredict(match.id, match.coin_a_mint)}
          style={{ flex: 1, background: bgA, border: borderA, borderRadius: 12, padding: 16, textAlign: 'left', cursor: connected && !submitted && !isCompleted ? 'pointer' : 'not-allowed', opacity: !connected ? 0.4 : 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <a
              href={'https://bags.fm/token/' + match.coin_a_mint}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <CoinAvatar coin={coinA} mint={match.coin_a_mint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinA?.symbol || match.coin_a_mint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinA?.name || 'Unknown'}</div>
            </div>
          </div>
          {isCompleted && <div style={{ fontSize: 11, fontWeight: 700, color: '#00C41C' }}>Score: {match.coin_a_score?.toFixed(1)}</div>}
          {selected === match.coin_a_mint && !isCompleted && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700 }}>✓ SELECTED</div>}
        </button>

        <div style={{ color: '#C8A84B', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>VS</div>

        <button
          disabled={!connected || submitted || isCompleted}
          onClick={() => onPredict(match.id, match.coin_b_mint)}
          style={{ flex: 1, background: bgB, border: borderB, borderRadius: 12, padding: 16, textAlign: 'left', cursor: connected && !submitted && !isCompleted ? 'pointer' : 'not-allowed', opacity: !connected ? 0.4 : 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <a
              href={'https://bags.fm/token/' + match.coin_b_mint}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <CoinAvatar coin={coinB} mint={match.coin_b_mint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinB?.symbol || match.coin_b_mint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinB?.name || 'Unknown'}</div>
            </div>
          </div>
          {isCompleted && <div style={{ fontSize: 11, fontWeight: 700, color: '#00C41C' }}>Score: {match.coin_b_score?.toFixed(1)}</div>}
          {selected === match.coin_b_mint && !isCompleted && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700 }}>✓ SELECTED</div>}
        </button>
      </div>

      {!connected && (
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 12 }}>Connect wallet to predict</p>
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
    } catch {
      setError('Failed to load arena')
    } finally {
      setLoading(false)
    }
  }

  async function fetchExistingPredictions() {
    if (!publicKey || !arena) return
    try {
      const res = await fetch('/api/predictions?wallet=' + publicKey.toString() + '&arena_id=' + arena.id)
      const data = await res.json()
      if (data.predictions && data.predictions.length > 0) {
        const map: { [matchId: string]: string } = {}
        data.predictions.forEach((p: any) => {
          map[p.match_id] = p.predicted_winner_mint
        })
        setPredictions(map)
        setSubmitted(true)
      }
    } catch {
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
    } catch {
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
              <span className={'w-2 h-2 rounded-full ' + (predictionOpen ? 'bg-[#00C41C] animate-pulse' : 'bg-yellow-500')} />
              <span className={'text-xs font-bold tracking-widest uppercase ' + (predictionOpen ? 'text-[#00C41C]' : 'text-yellow-500')}>
                {predictionOpen ? 'Prediction Window Open' : 'Arena Live — Predictions Closed'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">BATTLE <span className="text-[#00C41C]">ARENA</span></h1>
            <p className="text-gray-500 mt-2">
              {predictionOpen
                ? 'Predictions close at ' + new Date(arena.prediction_closes_at).toUTCString()
                : 'Arena ends at ' + new Date(arena.ends_at).toUTCString()}
            </p>
          </div>
        </div>

        {submitted && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/40 rounded-xl p-4 mb-8 text-center">
            <span className="text-[#00C41C] font-black">Predictions submitted! Good luck!</span>
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
              <div className="h-2 rounded-full bg-[#00C41C] transition-all" style={{ width: (totalMatches > 0 ? (totalPredicted / totalMatches) * 100 : 0) + '%' }} />
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
              <div className={'grid gap-4 ' + (round <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md')}>
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
                ? 'Pick ' + (totalMatches - totalPredicted) + ' more to submit'
                : 'All predictions ready — submit is final!'}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
