import { NextRequest, NextResponse } from 'next/server'
import { getTokenClaimStats } from '@/lib/bags'
import { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ARENA_TOKEN_MINT = process.env.ARENA_TOKEN_MINT
    if (!ARENA_TOKEN_MINT) {
      return NextResponse.json({ error: 'ARENA_TOKEN_MINT not set' }, { status: 400 })
    }

    // Dohvati claim stats sa Bags.fm
    const claimStats = await getTokenClaimStats(ARENA_TOKEN_MINT)

    if (!claimStats || claimStats.claimable <= 0) {
      return NextResponse.json({ message: 'Nothing to claim', claimable: claimStats?.claimable || 0 })
    }

    // Claim fees iz BagsAMM vault
    // Ovo koristi Bags.fm API za claim
    const claimRes = await fetch(`https://public-api-v2.bags.fm/api/claim/${ARENA_TOKEN_MINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.BAGS_API_KEY || '',
      },
      body: JSON.stringify({
        wallet: process.env.TREASURY_WALLET_ADDRESS,
      }),
    })

    if (!claimRes.ok) {
      const err = await claimRes.text()
      return NextResponse.json({ error: 'Claim failed: ' + err }, { status: 500 })
    }

    const claimData = await claimRes.json()

    return NextResponse.json({
      success: true,
      claimed: claimStats.claimable,
      tx: claimData.signature || null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Claim vault failed' }, { status: 500 })
  }
}
