'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Countdown from '@/components/ui/Countdown'
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
  matchId,
  coinAMint,
  coinBMint,
  round,
  coins,
  predictions,
  onPredict,
  connected,
  submitted,
  eligible,
  isPlaceholder,
}: {
  matchId: string
  coinAMint: string
  coinBMint: string
  round: number
  coins: { [mint: string]: Coin }
  predictions: { [matchId: string]: string }
  onPredict: (matchId: string, mint: string) => void
  connected: boolean
  submitted: boolean
  eligible: boolean
  isPlaceholder?: boolean
}) {
  const coinA = coins[coinAMint]
  const coinB = coins[coinBMint]
  const selected = predictions[matchId]
  const points = POINTS_MAP[round]
  const canPredict = connected && !submitted && eligible && !isPlaceholder && !!coinAMint && !!coinBMint

  const borderA = selected === coinAMint ? '2px solid #00C41C' : '2px solid transparent'
  const borderB = selected === coinBMint ? '2px solid #00C41C' : '2px solid transparent'
  const bgA = selected === coinAMint ? 'rgba(0,196,28,0.1)' : '#111'
  const bgB = selected === coinBMint ? 'rgba(0,196,28,0.1)' : '#111'

  if (isPlaceholder || !coinAMint || !coinBMint) {
    return (
      <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, opacity: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 700 }}>MATCH</span>
          <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 20 }}>
            {points} {points === 1 ? 'POINT' : 'POINTS'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, background: '#111', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ color: '#6B7280', fontSize: 12 }}>Winner from R{round - 1}</div>
          </div>
          <div style={{ color: '#6B7280', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>VS</div>
          <div style={{ flex: 1, background: '#111', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ color: '#6B7280', fontSize: 12 }}>Winner from R{round - 1}</div>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 11, marginTop: 12 }}>Pick winners in previous round to unlock</p>
      </div>
    )
  }

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
          disabled={!canPredict}
          onClick={() => onPredict(matchId, coinAMint)}
          style={{ flex: 1, background: bgA, border: borderA, borderRadius: 12, padding: 16, textAlign: 'left', cursor: canPredict ? 'pointer' : 'not-allowed', opacity: !connected || !eligible ? 0.5 : 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <a href={'https://bags.fm/token/' + coinAMint} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <CoinAvatar coin={coinA} mint={coinAMint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinA?.symbol || coinAMint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinA?.name || 'Unknown'}</div>
            </div>
          </div>
          {selected === coinAMint && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700 }}>✓ SELECTED</div>}
        </button>

        <div style={{ color: '#C8A84B', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>VS</div>

        <button
          disabled={!canPredict}
          onClick={() => onPredict(matchId, coinBMint)}
          style={{ flex: 1, background: bgB, border: borderB, borderRadius: 12, padding: 16, textAlign: 'left', cursor: canPredict ? 'pointer' : 'not-allowed', opacity: !connected || !eligible ? 0.5 : 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <a href={'https://bags.fm/token/' + coinBMint} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <CoinAvatar coin={coinB} mint={coinBMint} />
            </a>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{coinB?.symbol || coinBMint.slice(0, 8)}</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>{coinB?.name || 'Unknown'}</div>
            </div>
          </div>
          {selected === coinBMint && <div style={{ color: '#00C41C', fontSize: 11, fontWeight: 700 }}>✓ SELECTED</div>}
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
  const [eligible, setEligible] = useState<boolean>(true)
  const [eligibilityChecked, setEligibilityChecked] = useState<boolean>(false)

  useEffect(() => {
    fetchArena()
  }, [])

  useEffect(() => {
    if (connected && publicKey && arena) {
      fetchExistingPredictions()
    }
  }, [connected, publicKey, arena])

  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility()
    }
  }, [connected, publicKey])

  async function checkEligibility() {
    if (!publicKey) return
    try {
      const res = await fetch('/api/check-eligibility?wallet=' + publicKey.toString())
      const data = await res.json()
      setEligible(data.eligible)
      setEligibilityChecked(true)
    } catch {
      setEligible(true)
      setEligibilityChecked(true)
    }
  }

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

  // Get Round 1 matches from DB
  const r1Matches = arena.matches?.filter(m => m.round === 1) || []
  const r2Matches = arena.matches?.filter(m => m.round === 2) || []
  const sfMatches = arena.matches?.filter(m => m.round === 3) || []
  const finalMatch = arena.matches?.find(m => m.round === 4)

  // Build dynamic bracket from predictions
  // R2: winners of R1 matches 0-1, 2-3, 4-5, 6-7
  const getR2Coins = (pairIndex: number) => {
    const m1 = r1Matches[pairIndex * 2]
    const m2 = r1Matches[pairIndex * 2 + 1]
    const w1 = m1 ? predictions[m1.id] : null
    const w2 = m2 ? predictions[m2.id] : null
    return { coinA: w1 || '', coinB: w2 || '' }
  }

  // SF: winners of R2 matches 0-1, 2-3
  const getSFCoins = (pairIndex: number) => {
    const m1 = r2Matches[pairIndex * 2]
    const m2 = r2Matches[pairIndex * 2 + 1]
    const w1 = m1 ? predictions[m1.id] : null
    const w2 = m2 ? predictions[m2.id] : null
    return { coinA: w1 || '', coinB: w2 || '' }
  }

  // Final: winners of SF matches
  const getFinalCoins = () => {
    const m1 = sfMatches[0]
    const m2 = sfMatches[1]
    const w1 = m1 ? predictions[m1.id] : null
    const w2 = m2 ? predictions[m2.id] : null
    return { coinA: w1 || '', coinB: w2 || '' }
  }

  const totalMatches = arena.matches?.length || 15
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
            <div className="mt-2">
              <Countdown
                targetDate={predictionOpen ? arena.prediction_closes_at : arena.ends_at}
                label={predictionOpen ? 'Predictions close in' : 'Arena ends in'}
              />
            </div>
          </div>
        </div>

        {submitted && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/40 rounded-xl p-4 mb-8 text-center">
            <span className="text-[#00C41C] font-black">Predictions submitted! Good luck!</span>
          </div>
        )}

        {connected && eligibilityChecked && !eligible && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-8 text-center">
            <span className="text-red-400 font-black">
              You need at least 1,000 $ARENA tokens to predict.{' '}
              <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="underline ml-1">Get $ARENA</a>
            </span>
          </div>
        )}

        {connected && eligibilityChecked && eligible && !submitted && (
          <div className="bg-[#00C41C]/10 border border-[#00C41C]/30 rounded-xl p-3 mb-8 text-center">
            <span className="text-[#00C41C] text-sm font-bold">Eligible to predict</span>
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

        {/* Round 1 */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">⚔️ {ROUND_LABELS[1]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {r1Matches.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              coinAMint={match.coin_a_mint}
              coinBMint={match.coin_b_mint}
              round={1}
              coins={coinMap}
              predictions={predictions}
              onPredict={handlePrediction}
              connected={connected}
              submitted={submitted}
              eligible={eligible}
            />
          ))}
        </div>

        {/* Round 2 */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">🏆 {ROUND_LABELS[2]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {r2Matches.map((match, i) => {
            const { coinA, coinB } = getR2Coins(i)
            return (
              <MatchCard
                key={match.id}
                matchId={match.id}
                coinAMint={coinA}
                coinBMint={coinB}
                round={2}
                coins={coinMap}
                predictions={predictions}
                onPredict={handlePrediction}
                connected={connected}
                submitted={submitted}
                eligible={eligible}
                isPlaceholder={!coinA || !coinB}
              />
            )
          })}
        </div>

        {/* Semi Finals */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">🔥 {ROUND_LABELS[3]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {sfMatches.map((match, i) => {
            const { coinA, coinB } = getSFCoins(i)
            return (
              <MatchCard
                key={match.id}
                matchId={match.id}
                coinAMint={coinA}
                coinBMint={coinB}
                round={3}
                coins={coinMap}
                predictions={predictions}
                onPredict={handlePrediction}
                connected={connected}
                submitted={submitted}
                eligible={eligible}
                isPlaceholder={!coinA || !coinB}
              />
            )
          })}
        </div>

        {/* Final */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">👑 {ROUND_LABELS[4]}</h2>
        <div className="max-w-md mb-12">
          {finalMatch && (() => {
            const { coinA, coinB } = getFinalCoins()
            return (
              <MatchCard
                matchId={finalMatch.id}
                coinAMint={coinA}
                coinBMint={coinB}
                round={4}
                coins={coinMap}
                predictions={predictions}
                onPredict={handlePrediction}
                connected={connected}
                submitted={submitted}
                eligible={eligible}
                isPlaceholder={!coinA || !coinB}
              />
            )
          })()}
        </div>

        {connected && predictionOpen && !submitted && (
          <div className="text-center mt-10">
            <button
              onClick={handleSubmit}
              disabled={totalPredicted < totalMatches || submitting || !eligible}
              className="bg-[#00C41C] text-black font-black px-16 py-5 rounded-xl text-xl hover:bg-[#00E620] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,196,28,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT PREDICTIONS'}
            </button>
            <p className="text-gray-600 text-sm mt-3">
              {!eligible
                ? 'You need $ARENA tokens to submit'
                : totalPredicted < totalMatches
                ? 'Pick ' + (totalMatches - totalPredicted) + ' more to submit'
                : 'All predictions ready — submit is final!'}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
