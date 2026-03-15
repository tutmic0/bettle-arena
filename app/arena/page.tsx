'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'

const MOCK_COINS = [
  { symbol: 'DOGE2', name: 'Doge 2.0', mint: '1111' },
  { symbol: 'PEPE', name: 'Pepe Classic', mint: '2222' },
  { symbol: 'SHIB2', name: 'Shiba 2', mint: '3333' },
  { symbol: 'MOON', name: 'Moon Token', mint: '4444' },
  { symbol: 'CHAD', name: 'Chad Coin', mint: '5555' },
  { symbol: 'WOJAK', name: 'Wojak', mint: '6666' },
  { symbol: 'BONK2', name: 'Bonk 2', mint: '7777' },
  { symbol: 'FROG', name: 'Frog Token', mint: '8888' },
  { symbol: 'APE', name: 'Ape Coin', mint: '9999' },
  { symbol: 'BULL', name: 'Bull Run', mint: '1010' },
  { symbol: 'BEAR', name: 'Bear Trap', mint: '1011' },
  { symbol: 'PUMP', name: 'Pump It', mint: '1212' },
  { symbol: 'DUMP', name: 'Dump Token', mint: '1313' },
  { symbol: 'GEM', name: 'Hidden Gem', mint: '1414' },
  { symbol: 'REKT', name: 'Rekt Finance', mint: '1515' },
  { symbol: 'SEND', name: 'Send It', mint: '1616' },
]

const ROUND1_MATCHES = [
  { id: 1, coinA: MOCK_COINS[0], coinB: MOCK_COINS[1] },
  { id: 2, coinA: MOCK_COINS[2], coinB: MOCK_COINS[3] },
  { id: 3, coinA: MOCK_COINS[4], coinB: MOCK_COINS[5] },
  { id: 4, coinA: MOCK_COINS[6], coinB: MOCK_COINS[7] },
  { id: 5, coinA: MOCK_COINS[8], coinB: MOCK_COINS[9] },
  { id: 6, coinA: MOCK_COINS[10], coinB: MOCK_COINS[11] },
  { id: 7, coinA: MOCK_COINS[12], coinB: MOCK_COINS[13] },
  { id: 8, coinA: MOCK_COINS[14], coinB: MOCK_COINS[15] },
]

const ROUND2_MATCHES = [
  { id: 9, slot: 'Winner M1', slotB: 'Winner M2' },
  { id: 10, slot: 'Winner M3', slotB: 'Winner M4' },
  { id: 11, slot: 'Winner M5', slotB: 'Winner M6' },
  { id: 12, slot: 'Winner M7', slotB: 'Winner M8' },
]

const SEMI_MATCHES = [
  { id: 13, slot: 'Winner M9', slotB: 'Winner M10' },
  { id: 14, slot: 'Winner M11', slotB: 'Winner M12' },
]

const FINAL_MATCH = { id: 15, slot: 'Winner SF1', slotB: 'Winner SF2' }

function MatchCard({
  matchId,
  coinA,
  coinB,
  labelA,
  labelB,
  points,
  predictions,
  onPredict,
  connected,
  r1Predictions,
}: {
  matchId: number
  coinA?: { symbol: string; name: string; mint: string }
  coinB?: { symbol: string; name: string; mint: string }
  labelA?: string
  labelB?: string
  points: number
  predictions: { [k: number]: string }
  onPredict: (matchId: number, mint: string) => void
  connected: boolean
  r1Predictions?: { [k: number]: string }
}) {
  const mintA = coinA?.mint || `slot-a-${matchId}`
  const mintB = coinB?.mint || `slot-b-${matchId}`
  const nameA = coinA?.symbol || labelA || '?'
  const nameB = coinB?.symbol || labelB || '?'
  const subA = coinA?.name || 'TBD'
  const subB = coinB?.name || 'TBD'
  const selected = predictions[matchId]

  return (
    <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-5 hover:border-[#00C41C]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 text-xs font-bold">MATCH #{matchId}</span>
        <span className="text-[#00C41C] text-xs font-bold bg-[#00C41C]/10 px-2 py-1 rounded-full">{points} {points === 1 ? 'POINT' : 'POINTS'}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={!connected}
          onClick={() => onPredict(matchId, mintA)}
          className={`flex-1 bg-[#111] border-2 rounded-xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            selected === mintA ? 'border-[#00C41C] bg-[#00C41C]/10' : 'border-transparent hover:border-[#00C41C]/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#00C41C]/20 flex items-center justify-center mb-3 text-xs font-black text-[#00C41C]">
            {nameA.slice(0, 2)}
          </div>
          <div className="font-black text-white text-sm">{nameA}</div>
          <div className="text-gray-500 text-xs">{subA}</div>
          {selected === mintA && <div className="mt-2 text-[#00C41C] text-xs font-bold">✓ SELECTED</div>}
        </button>

        <div className="text-[#C8A84B] font-black text-lg shrink-0">VS</div>

        <button
          disabled={!connected}
          onClick={() => onPredict(matchId, mintB)}
          className={`flex-1 bg-[#111] border-2 rounded-xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            selected === mintB ? 'border-[#00C41C] bg-[#00C41C]/10' : 'border-transparent hover:border-[#00C41C]/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#00C41C]/20 flex items-center justify-center mb-3 text-xs font-black text-[#00C41C]">
            {nameB.slice(0, 2)}
          </div>
          <div className="font-black text-white text-sm">{nameB}</div>
          <div className="text-gray-500 text-xs">{subB}</div>
          {selected === mintB && <div className="mt-2 text-[#00C41C] text-xs font-bold">✓ SELECTED</div>}
        </button>
      </div>
      {!connected && (
        <p className="text-center text-gray-600 text-xs mt-3">Connect wallet to predict</p>
      )}
    </div>
  )
}

export default function ArenaPage() {
  const { connected } = useWallet()
  const [predictions, setPredictions] = useState<{ [k: number]: string }>({})

  const handlePrediction = (matchId: number, mint: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: mint }))
  }

  const totalPredicted = Object.keys(predictions).length
  const totalMatches = 15

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00C41C] animate-pulse" />
              <span className="text-[#00C41C] text-xs font-bold tracking-widest uppercase">Prediction Window Open</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">ARENA <span className="text-[#00C41C]">#001</span></h1>
            <p className="text-gray-500 mt-2">Predictions close at <span className="text-white font-bold">09:00 UTC</span></p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm mb-1">Reward Pool</div>
            <div className="text-[#C8A84B] font-black text-3xl">$4,280</div>
            <div className="text-gray-600 text-xs">80% to top 10 predictors</div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-4 mb-10 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Your predictions: <span className="text-white font-black">{totalPredicted}/{totalMatches}</span></span>
          <div className="flex-1 mx-6 bg-[#111] rounded-full h-2">
            <div className="h-2 rounded-full bg-[#00C41C] transition-all" style={{ width: `${(totalPredicted / totalMatches) * 100}%` }} />
          </div>
          <span className="text-[#00C41C] font-black text-sm">{Math.round((totalPredicted / totalMatches) * 100)}%</span>
        </div>

        {/* Points legend */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {[
            { round: 'Round 1', points: '1 pt' },
            { round: 'Round 2', points: '2 pts' },
            { round: 'Semi-Final', points: '3 pts' },
            { round: 'Final', points: '5 pts' },
          ].map((item) => (
            <div key={item.round} className="flex items-center gap-2 bg-[#0A0A0A] border border-[#00C41C]/20 rounded-lg px-4 py-2">
              <span className="text-gray-400 text-sm">{item.round}</span>
              <span className="text-[#00C41C] font-black text-sm">{item.points}</span>
            </div>
          ))}
        </div>

        {/* Round 1 */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">⚔️ Round 1 — 1 Point Each</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {ROUND1_MATCHES.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              coinA={match.coinA}
              coinB={match.coinB}
              points={1}
              predictions={predictions}
              onPredict={handlePrediction}
              connected={connected}
            />
          ))}
        </div>

        {/* Round 2 */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">🏆 Round 2 — 2 Points Each</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {ROUND2_MATCHES.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              labelA={match.slot}
              labelB={match.slotB}
              points={2}
              predictions={predictions}
              onPredict={handlePrediction}
              connected={connected}
            />
          ))}
        </div>

        {/* Semi Finals */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">🔥 Semi-Finals — 3 Points Each</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {SEMI_MATCHES.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              labelA={match.slot}
              labelB={match.slotB}
              points={3}
              predictions={predictions}
              onPredict={handlePrediction}
              connected={connected}
            />
          ))}
        </div>

        {/* Final */}
        <h2 className="text-lg font-black text-gray-400 tracking-widest uppercase mb-6">👑 Final — 5 Points</h2>
        <div className="max-w-md mb-12">
          <MatchCard
            matchId={FINAL_MATCH.id}
            labelA={FINAL_MATCH.slot}
            labelB={FINAL_MATCH.slotB}
            points={5}
            predictions={predictions}
            onPredict={handlePrediction}
            connected={connected}
          />
        </div>

        {/* Submit */}
        {connected && (
          <div className="text-center">
            <button
              disabled={totalPredicted < totalMatches}
              className="bg-[#00C41C] text-black font-black px-16 py-5 rounded-xl text-xl hover:bg-[#00E620] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,196,28,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              SUBMIT PREDICTIONS ⚔️
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