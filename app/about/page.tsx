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
            The first meme coin prediction platform built on Bags.fm — predict which coins win, earn daily rewards.
          </p>
        </div>

        {/* What is it */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 text-[#00C41C]">What is Battle Arena?</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Battle Arena runs continuous prediction rounds throughout the day. Every 4 hours, 20 fresh meme coins from Bags.fm face off in 10 head-to-head matches. Users who hold <span className="text-white font-bold">$ARENA</span> tokens predict which coin wins each match. The most accurate predictors earn a share of the daily trading fee pool.
          </p>
          <p className="text-gray-400 leading-relaxed">
            At the end of each day, the top 10 predictors are crowned and rewarded. Then it all resets — a brand new day of battles begins.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">How It Works</h2>
          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'New Round — Every 4 Hours',
                desc: '20 of the most active meme coins from Bags.fm are automatically selected and paired into 10 head-to-head matches. A new round starts, and the prediction window opens.'
              },
              {
                step: '02',
                title: 'Predict — 1 Hour Window',
                desc: 'Hold $ARENA tokens, connect your Solana wallet, and pick the winner of each match. You have 1 hour to submit your predictions. Once submitted, they are final.'
              },
              {
                step: '03',
                title: 'Battle — 3 Hours',
                desc: 'The prediction window closes and the battle begins. Each coin is scored using on-chain metrics: unique wallet growth, buy/sell ratio, price performance, transaction count, and holder retention.'
              },
              {
                step: '04',
                title: 'Results & Points',
                desc: 'After 3 hours, winners are determined. Every correct prediction earns 1 point. Your points accumulate throughout the day across all rounds you participate in.'
              },
              {
                step: '05',
                title: 'Daily Rewards',
                desc: 'At the end of each day, the leaderboard is finalized. The top 10 predictors share 80% of the daily $ARENA trading fees — automatically sent to their wallets.'
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

        {/* Round structure */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Round Structure</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Coins per round', value: '20' },
              { label: 'Matches per round', value: '10' },
              { label: 'Rounds per day', value: '6' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-[#00C41C]/20 rounded-xl p-4 text-center">
                <div className="text-[#00C41C] font-black text-3xl mb-1">{item.value}</div>
                <div className="text-gray-500 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Prediction window', value: '1 hour', color: '#00C41C' },
              { label: 'Battle duration', value: '3 hours', color: '#C8A84B' },
              { label: 'Points per correct pick', value: '1 pt', color: '#00C41C' },
              { label: 'Max points per round', value: '10 pts', color: '#C8A84B' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-[#00C41C]/10 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-gray-400 text-sm">{item.label}:</span>
                <span className="font-black text-sm" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 text-[#00C41C]">Scoring Formula</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Each coin is scored using 5 on-chain metrics. Anti-manipulation rules apply: minimum transaction size of $20, 30-minute wallet cooldown, and a 2% whale cap per wallet.
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

        {/* Rewards */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 text-[#00C41C]">Daily Reward Distribution</h2>
          <p className="text-gray-400 mb-6 text-sm">
            80% of daily $ARENA trading fees go to the top 10 predictors. Rewards are distributed automatically at end of day.
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

        {/* Tech */}
        <div className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 text-[#00C41C]">Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Bags.fm API', desc: 'Token data, fee vaults, pool state' },
              { name: 'Helius API', desc: 'Solana on-chain indexing, token metadata' },
              { name: 'Supabase', desc: 'PostgreSQL database for round state' },
              { name: 'Next.js', desc: 'Frontend and API routes' },
              { name: 'Vercel', desc: 'Hosting and automated cron jobs' },
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
