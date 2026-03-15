'use client'

import Navbar from '@/components/ui/Navbar'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { connected } = useWallet()

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,196,28,0.08)_0%,_transparent_70%)] pointer-events-none" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,196,28,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,28,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Bettle"
            width={180}
            height={180}
            className="mb-8 drop-shadow-[0_0_40px_rgba(0,196,28,0.5)]"
          />

          <div className="inline-flex items-center gap-2 bg-[#00C41C]/10 border border-[#00C41C]/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00C41C] animate-pulse" />
            <span className="text-[#00C41C] text-xs font-bold tracking-widest uppercase">Built on Bags.fm</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 leading-none">
            BETTLE
            <span className="block text-[#00C41C]">ARENA</span>
          </h1>

          <p className="text-gray-400 text-xl md:text-2xl mb-10 max-w-xl">
            Predict which meme coin survives. Hold <span className="text-[#00C41C] font-bold">$ARENA</span>. Earn daily rewards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {connected ? (
              <Link href="/arena"
                className="bg-[#00C41C] text-black font-black px-10 py-4 rounded-lg text-lg hover:bg-[#00E620] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,196,28,0.5)]">
                ENTER ARENA ⚔️
              </Link>
            ) : (
              <WalletMultiButton style={{
                backgroundColor: '#00C41C',
                color: '#000000',
                fontWeight: '900',
                borderRadius: '8px',
                fontSize: '18px',
                padding: '16px 40px',
              }} />
            )}
            <Link href="/leaderboard"
              className="border border-[#00C41C]/40 text-[#00C41C] font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#00C41C]/10 transition-all">
              LEADERBOARD
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-[#00C41C]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16 tracking-tight">
            HOW IT <span className="text-[#00C41C]">WORKS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
{ step: '01', title: 'Hold $ARENA', desc: 'Hold minimum $ARENA tokens to be eligible for predictions', icon: '💎' },              { step: '02', title: 'Arena Opens', desc: 'Every day at 21:00 UTC — 16 top coins enter the bracket', icon: '⚔️' },
              { step: '03', title: 'Predict', desc: 'Pick winners before 09:00 UTC. More points for later rounds', icon: '🎯' },
              { step: '04', title: 'Earn', desc: 'Top 10 predictors split 80% of daily trading fees', icon: '💰' },
            ].map((item) => (
              <div key={item.step} className="relative bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-6 hover:border-[#00C41C]/50 transition-all group">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-[#00C41C]/30 font-black text-5xl absolute top-4 right-4">{item.step}</div>
                <h3 className="text-white font-black text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="py-24 px-6 bg-[#050505] border-t border-[#00C41C]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-4 tracking-tight">
            SCORING <span className="text-[#00C41C]">FORMULA</span>
          </h2>
          <p className="text-gray-500 text-center mb-16">Fair, transparent, manipulation-resistant</p>

          <div className="space-y-4">
            {[
              { label: 'Unique Wallet Growth', weight: 30, color: '#00C41C' },
              { label: 'Buy / Sell Ratio', weight: 25, color: '#00A818' },
              { label: 'Price Performance', weight: 20, color: '#008C14' },
              { label: 'Transaction Count', weight: 15, color: '#007010' },
              { label: 'Holder Retention', weight: 10, color: '#00540C' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-gray-400 text-sm w-48 shrink-0">{item.label}</span>
                <div className="flex-1 bg-[#111] rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${item.weight}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="text-white font-black text-sm w-10 text-right">{item.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="py-24 px-6 border-t border-[#00C41C]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            DAILY <span className="text-[#00C41C]">REWARDS</span>
          </h2>
          <p className="text-gray-500 mb-16">Top 10 predictors earn from every arena</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <div key={item.rank} className="bg-[#0A0A0A] border border-[#00C41C]/20 rounded-xl p-4 hover:border-[#00C41C]/50 transition-all">
                <div className="text-[#C8A84B] font-black text-lg">{item.rank}</div>
                <div className="text-[#00C41C] font-black text-2xl">{item.pct}%</div>
                <div className="text-gray-600 text-xs">of pool</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00C41C]/10 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image src="/logo.png" alt="Bettle" width={24} height={24} />
          <span className="text-white font-black tracking-wider">BETTLE ARENA</span>
        </div>
        <p className="text-gray-600 text-sm">Built on Bags.fm · Powered by Solana</p>
      </footer>
    </main>
  )
}