'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Home() {
  const { connected, publicKey } = useWallet()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">BETTLE</h1>
      <p className="text-gray-400 text-xl mb-8">Predict. Hold. Earn.</p>
      <WalletMultiButton />
      {connected && (
        <p className="mt-4 text-green-400">
          Connected: {publicKey?.toString().slice(0, 8)}...
        </p>
      )}
    </main>
  )
}