'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Countdown from '@/components/ui/Countdown'
import { useWallet } from '@solana/wallet-adapter-react'

const ARENA_MINT = process.env.NEXT_PUBLIC_ARENA_TOKEN_MINT || ''
const BUY_URL = ARENA_MINT ? 'https://bags.fm/' + ARENA_MINT : 'https://bags.fm'

interface Coin {
  token_mint: string
  name: string
  symbol: string
  image_url?: string
}

interface Match {
  id: string
  coin_a_mint: string
  coin_b_mint: string
  coin_a_score: number
  coin_b_score: number
  winner_mint?: string
  status: string
}

interface Round {
  id: string
  date: string
  round_number: number
  status: string
  prediction_opens_at: string
  prediction_closes_at: string
  ends_at: string
  round_matches: Match[]
  round_coins: Coin[]
}

function CoinAvatar({ coin, mint }: { coin?: Coin; mint: string }) {
  const symbol = coin?.symbol || mint.slice(0, 4).toUpperCase()
  const initials = symbol.slice(0, 2).toUpperCase()

  if (coin?.image_url) {
    return (
      <img
        src={coin.image_url}
        alt={symbol}
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
  coinMap,
  selected,
  onSelect,
  canPredict,
}: {
  match: Match
  coinMap: { [mint: string]: Coin }
  selected?: string
  onSelect: (mint: string) => void
  canPredict: boolean
}) {
  const coinA = coinMap[match.coin_a_mint]
  const coinB = coinMap[match.coin_b_mint]
  const hasScores = (match.coin_a_score > 0 || match.coin_b_score > 0)
  const isLeadingA = hasScores && !match.winner_mint && match.coin_a_score > match.coin_b_score
  const isLeadingB = hasScores && !match.winner_mint && match.coin_b_score > match.coin_a_score
  const isWinnerA = match.winner_mint === match.coin_a_mint
  const isWinnerB = match.winner_mint === match.coin_b_mint

  const getStyle = (mint: string, isWinner: boolean, isLeading: boolean) => {
    const isSelected = selected === mint
    let border = '2px solid transparent'
    let bg = '#111'
    if (isWinner) { border = '2px solid #C8A84B'; bg = 'rgba(200,168,75,0.1)' }
    else if (isSelected) { border = '2px solid #00C41C'; bg = 'rgba(0,196,28,0.1)' }
    else if (isLeading) { border = '2px solid rgba(0,196,28,0.4)' }
    return { border, background: bg, borderRadius: 12, padding: 16, flex: 1, textAlign: 'left' as const, cursor: canPredict ? 'pointer' : 'default', opacity: 1 }
  }

  return (
    <div style={{ background: '#0A0A0A', border: '1px solid rgba(0,196,28,0.2)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          disabled={!canPredict}
          onClick={() => canPredict && onSelect(match.coin_a_mint)}
          style={getStyle(match.coin_a_mint, isWinnerA, isLeadingA)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <a href={'https://bags.fm/' + match.coin_a_mint} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <CoinAvatar coin={coinA} mint={match.coin_a_mint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinA?.symbol || match.coin_a_mint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinA?.name || 'Unknown'}</div>
            </div>
          </div>
          {hasScores && <div style={{ fontSize: 11, color: '#6B7280' }}>Score: <span style={{ color: '#00C41C', fontWeight: 700 }}>{match.coin_a_score.toFixed(1)}</span></div>}
          {isWinnerA && <div style={{ color: '#C8A84B', fontSize: 11, fontWeight: 700, marginTop: 4 }}>WINNER 👑</div>}
          {isLeadingA && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700, marginTop: 4 }}>LEADING 📈</div>}
          {selected === match.coin_a_mint && !isWinnerA && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700, marginTop: 4 }}>✓ SELECTED</div>}
        </button>

        <div style={{ color: '#C8A84B', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>VS</div>

        <button
          disabled={!canPredict}
          onClick={() => canPredict && onSelect(match.coin_b_mint)}
          style={getStyle(match.coin_b_mint, isWinnerB, isLeadingB)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <a href={'https://bags.fm/' + match.coin_b_mint} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <CoinAvatar coin={coinB} mint={match.coin_b_mint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinB?.symbol || match.coin_b_mint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinB?.name || 'Unknown'}</div>
            </div>
          </div>
          {hasScores && <div style={{ fontSize: 11, color: '#6B7280' }}>Score: <span style={{ color: '#00C41C', fontWeight: 700 }}>{match.coin_b_score.toFixed(1)}</span></div>}
          {isWinnerB && <div style={{ color: '#C8A84B', fontSize: 11, fontWeight: 700, marginTop: 4 }}>WINNER 👑</div>}
          {isLeadingB && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700, marginTop: 4 }}>LEADING 📈</div>}
          {selected === match.coin_b_mint && !isWinnerB && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700, marginTop: 4 }}>✓ SELECTED</div>}
        </button>
      </div>
    </div>
  )
}

export default function ArenaPage() {
  const { connected, publicKey } = useWallet()
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [eligible, setEligible] = useState(true)
  const [minSol, setMinSol] = useState(0.2)

  useEffect(() => { fetchRound() }, [])

  useEffect(() => {
    if (connected && publicKey) checkEligibility()
  }, [connected, publicKey])

  useEffect(() => {
    if (connected && publicKey && round) fetchPredictions()
  }, [connected, publicKey, round])

  async function fetchRound() {
    try {
      const res = await fetch('/api/round')
      const data = await res.json()
      setRound(data.round)
    } catch { } finally { setLoading(false) }
  }

  async function checkEligibility() {
    if (!publicKey) return
    try {
      const res = await fetch('/api/check-eligibility?wallet=' + publicKey.toString())
      const data = await res.json()
      setEligible(data.eligible)
      setMinSol(data.required_sol || 0.2)
    } catch { setEligible(true) }
  }

  async function fetchPredictions() {
    if (!publicKey || !round) return
    try {
      const res = await fetch('/api/predictions?wallet=' + publicKey.toString() + '&round_id=' + round.id)
      const data = await res.json()
      if (data.predictions?.length > 0) {
        const map: { [k: string]: string } = {}
        data.predictions.forEach((p: any) => { map[p.match_id] = p.predicted_winner_mint })
        setPredictions(map)
        setSubmitted(true)
      }
    } catch { }
  }

  async function handleSubmit() {
    if (!publicKey || !round) return
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
          round_id: round.id,
          predictions: predictionsArray,
        }),
      })

      const data = await res.json()
      if (data.success) setSubmitted(true)
    } catch { } finally { setSubmitting(false) }
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

  if (!round) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-6xl">⚔️</div>
          <h1 className="text-3xl font-black">No Active Round</h1>
          <p className="text-gray-500">Next round starts soon</p>
        </div>
      </main>
    )
  }

  const coinMap: { [mint: string]: Coin } = {}
  round.round_coins?.forEach(c => { coinMap[c.token_mint] = c })

  const predictionOpen = round.status === 'predicting' && new Date() < new Date(round.prediction_closes_at)
  const totalMatches = round.round_matches?.length || 0
  const totalPredicted = Object.keys(predictions).length
  const canPredict = connected && eligible && predictionOpen && !submitted

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={'w-2 h-2 rounded-full animate-pulse ' + (predictionOpen ? 'bg-[#00C41C]' : 'bg-yellow-500')} />
            <span className={'text-xs font-bold tracking-widest uppercase ' + (predictionOpen ? 'text-[#00C41C]' : 'text-yellow-500')}>
              {predictionOpen ? 'Prediction Window Open' : round.status === 'active' ? 'Round Live' : 'Round Completed'}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2">
            BATTLE <span className="text-[#00C41C]">ARENA</span>
            <span className="text-gray-600 text-2xl ml-4">Round {round.round_number}</span>
          </h1>
          <Countdown
            targetDate={predictionOpen ? round.prediction_closes_at : round.ends_at}
            label={predictionOpen ? 'Predictions close in' : 'Round ends in'}
          />
          {!predictionOpen && round.status === 'predicting' && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 inline-block">
              <p className="text-yellow-500 text-sm font-bold">Prediction window closed — round in progress</p>
            </div>
          )}
        </div>

        {/* Eligibility */}
        {connected && !eligible && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-6 text-center">
            <span className="text-red-400 font-black">
              You need at least {minSol} SOL worth of $ARENA tokens.{' '}
              <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="underline">Buy $ARENA</a>
            </span>
          </div>
        )}

        {submitted && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/40 rounded-xl p-4 mb-6 text-center">
            <span className="text-[#00C41C] font-black">✓ Predictions submitted! Good luck!</span>
          </div>
        )}

        {/* Progress */}
        {canPredict && (
          <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-4 mb-8 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Predictions: <span className="text-white font-black">{totalPredicted}/{totalMatches}</span></span>
            <div className="flex-1 mx-6 bg-[#111] rounded-full h-2">
              <div className="h-2 rounded-full bg-[#00C41C] transition-all" style={{ width: (totalMatches > 0 ? (totalPredicted / totalMatches) * 100 : 0) + '%' }} />
            </div>
            <span className="text-[#00C41C] font-black text-sm">{totalMatches > 0 ? Math.round((totalPredicted / totalMatches) * 100) : 0}%</span>
          </div>
        )}

        {/* Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {round.round_matches?.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              coinMap={coinMap}
              selected={predictions[match.id]}
              onSelect={(mint) => {
                if (!canPredict) return
                setPredictions(prev => ({ ...prev, [match.id]: mint }))
              }}
              canPredict={canPredict}
            />
          ))}
        </div>

        {/* Submit */}
        {canPredict && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={totalPredicted < totalMatches || submitting}
              className="bg-[#00C41C] text-black font-black px-16 py-5 rounded-xl text-xl hover:bg-[#00E620] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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

        {!connected && (
          <div className="text-center mt-8">
            <p className="text-gray-500">Connect wallet to predict</p>
          </div>
        )}

      </div>
    </main>
  )
}
