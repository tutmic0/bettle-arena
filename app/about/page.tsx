'use client'

import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <Image src="/logo.png" alt="Battle Arena" width={100} height={100} className="mx-auto mb-6" />
          <h1 className="text-6xl font-black tracking-tight mb-4">
            BATTLE <span className="text-[#00C41C]">ARENA</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            The first prediction platform built on Bags.fm — where meme coins battle for survival and the smartest predictors earn daily rewards.
          </p>
        </div>

        {/* What is it */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 text-[#00C41C]">What is Battle Arena?</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Battle Arena is a daily prediction game built on top of Bags.fm. Every day, 16 of the most active meme coins launched on Bags.fm automatically enter a tournament bracket. Users who hold <span className="text-white font-bold">$ARENA</span> tokens predict which coins will outperform their opponents — and the best predictors win a share of the daily trading fee pool.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Everything is on-chain, transparent, and automated. No manual selection, no centralized control — the system runs itself via smart cron jobs that select coins, run scoring snapshots, and distribute rewards automatically.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">How It Works</h2>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Arena Formation — 21:00 UTC',
                desc: 'Every day at 21:00 UTC, the system automatically selects the top 16 eligible coins launched on Bags.fm that day. Coins are ranked by a combination of unique wallet growth (40%) and trading volume (40%). The arena is published and users can start researching coins immediately.'
              },
              {
                step: '02',
                title: 'Prediction Window — 21:00 to 09:00 UTC',
                desc: 'Users who hold the minimum required $ARENA tokens connect their Solana wallet and predict winners across all 15 matches in the bracket — Round 1, Round 2, Semi-Finals, and the Final. All predictions must be submitted before 09:00 UTC. Once submitted, predictions are final and cannot be changed.'
              },
              {
                step: '03',
                title: 'Arena Begins — 09:00 UTC',
                desc: 'The prediction window closes and mech scoring begins. Every 6 hours, the system takes a snapshot of each coin\'s on-chain performance using 5 weighted metrics: Unique Wallet Growth (30%), Buy/Sell Ratio (25%), Price Performance (20%), Transaction Count (15%), and Holder Retention (10%).'
              },
              {
                step: '04',
                title: 'Results & Rewards — 09:00 UTC next day',
                desc: 'After 24 hours and 4 snapshots, winners are determined by average score. The leaderboard is finalized, ranking all predictors by total points earned. Top 10 predictors share 80% of the daily trading fee pool from $ARENA token — distributed in a stepped structure from 25% for 1st place down to 4% for 10th place.'
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="text-[#00C41C]/30 font-black text-4xl shrink-0 w-12">{item.step}</div>
                <div>
                  <h3 className="text-white font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Scoring Formula</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Each coin is scored using 5 on-chain metrics, measured across 4 snapshots every 6 hours. The final score is the average of all snapshots. Anti-manipulation rules apply: minimum transaction size of $20, 30-minute wallet cooldown, and a 2% whale cap per wallet.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Unique Wallet Growth', weight: 30, color: '#00C41C' },
              { label: 'Buy / Sell Ratio', weight: 25, color: '#00A818' },
              { label: 'Price Performance', weight: 20, color: '#008C14' },
              { label: 'Transaction Count', weight: 15, color: '#007010' },
              { label: 'Holder Retention', weight: 10, color: '#00540C' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-gray-400 text-sm w-48 shrink-0">{item.label}</span>
                <div className="flex-1 bg-[#111] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: item.weight + '%', backgroundColor: item.color }} />
                </div>
                <span className="text-white font-black text-sm w-10 text-right">{item.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Points */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Points System</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Users predict all 15 matches simultaneously at the start of each arena. Points increase for later rounds — rewarding users who correctly predict deep into the bracket.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { round: 'Round 1', matches: '8 matches', points: '1 pt each', max: '8 pts' },
              { round: 'Round 2', matches: '4 matches', points: '2 pts each', max: '8 pts' },
              { round: 'Semi-Final', matches: '2 matches', points: '3 pts each', max: '6 pts' },
              { round: 'Final', matches: '1 match', points: '5 pts', max: '5 pts' },
            ].map((item) => (
              <div key={item.round} className="bg-[#111] border border-[#00C41C]/20 rounded-xl p-4 text-center">
                <div className="text-[#00C41C] font-black text-sm mb-1">{item.round}</div>
                <div className="text-gray-500 text-xs mb-2">{item.matches}</div>
                <div className="text-white font-black">{item.points}</div>
                <div className="text-gray-600 text-xs mt-1">max {item.max}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center">Maximum 27 points per arena · Tiebreaker: earliest correct prediction timestamp</p>
        </div>

        {/* Rewards */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Reward Distribution</h2>
          <p className="text-gray-400 mb-6 text-sm">
            80% of daily $ARENA trading fees go to the top 10 predictors. 20% goes to the platform. Rewards are distributed automatically via BagsAMM Fee Share vaults at the end of each arena.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { rank: '1st', pct: 25 },
              { rank: '2nd', pct: 18 },
              { rank: '3rd', pct: 13 },
              { rank: '4th', pct: 10 },
              { rank: '5th', pct: 8 },
              { rank: '6th', pct: 7 },
              { rank: '7th', pct: 6 },
              { rank: '8th', pct: 5 },
              { rank: '9th', pct: 4 },
              { rank: '10th', pct: 4 },
            ].map((item) => (
              <div key={item.rank} className="bg-[#111] border border-[#00C41C]/20 rounded-xl p-3 text-center">
                <div className="text-[#C8A84B] font-black text-sm">{item.rank}</div>
                <div className="text-[#00C41C] font-black text-xl">{item.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Bags.fm API', desc: 'Token data, fee vaults, pool state' },
              { name: 'Helius API', desc: 'Solana on-chain indexing, token metadata' },
              { name: 'Supabase', desc: 'PostgreSQL database for arena state' },
              { name: 'Next.js', desc: 'Frontend and API routes' },
              { name: 'Vercel', desc: 'Hosting and cron job execution' },
              { name: 'Solana Wallet Adapter', desc: 'Phantom, Solflare, OKX support' },
            ].map((item) => (
              <div key={item.name} className="bg-[#111] border border-[#00C41C]/10 rounded-xl p-4">
                <div className="text-white font-black text-sm mb-1">{item.name}</div>
                <div className="text-gray-500 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/arena"
            className="bg-[#00C41C] text-black font-black px-12 py-4 rounded-xl text-lg hover:bg-[#00E620] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,196,28,0.4)] inline-block"
          >
            ENTER ARENA ⚔️
          </Link>
        </div>

      </div>
    </main>
  )
}
