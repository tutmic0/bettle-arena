'use client'

import { useState, useEffect } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#00C41C]/20 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Bettle"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-white font-black text-xl tracking-wider">
            BETTLE
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/arena" className="text-gray-400 hover:text-[#00C41C] transition-colors text-sm font-semibold tracking-wide">
            ARENA
          </Link>
          <Link href="/leaderboard" className="text-gray-400 hover:text-[#00C41C] transition-colors text-sm font-semibold tracking-wide">
            LEADERBOARD
          </Link>
          <Link href="/profile" className="text-gray-400 hover:text-[#00C41C] transition-colors text-sm font-semibold tracking-wide">
            PROFILE
          </Link>
          {mounted && (
            <WalletMultiButton style={{
              backgroundColor: '#00C41C',
              color: '#000000',
              fontWeight: '700',
              borderRadius: '8px',
              fontSize: '14px',
            }} />
          )}
        </div>

      </div>
    </nav>
  )
}