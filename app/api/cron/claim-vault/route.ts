import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ARENA_TOKEN_MINT = process.env.ARENA_TOKEN_MINT
    const PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY
    const BAGS_API_KEY = process.env.BAGS_API_KEY
    const RPC_URL = process.env.HELIUS_API_KEY
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      : 'https://api.mainnet-beta.solana.com'

    if (!ARENA_TOKEN_MINT || !PRIVATE_KEY || !BAGS_API_KEY) {
      return NextResponse.json({ error: 'Missing env variables' }, { status: 400 })
    }

    const { BagsSDK, signAndSendTransaction } = await import('@bagsfm/bags-sdk')

    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))
    const connection = new Connection(RPC_URL, 'processed')
    const sdk = new BagsSDK(BAGS_API_KEY, connection, 'processed')

    // Dohvati sve claimable pozicije
    const allPositions = await sdk.fee.getAllClaimablePositions(keypair.publicKey)

    if (!allPositions || allPositions.length === 0) {
      return NextResponse.json({ message: 'No claimable positions' })
    }

    // Filtriraj za $ARENA token sa nečim za claimati
    const targetPositions = allPositions.filter(
      (p: any) => p.baseMint === ARENA_TOKEN_MINT && 
      (p.totalClaimableLamportsUserShare > 0 || p.virtualPoolClaimableLamportsUserShare > 0)
    )

    if (targetPositions.length === 0) {
      return NextResponse.json({ 
        message: 'Nothing to claim',
        total_positions: allPositions.length 
      })
    }

    const signatures: string[] = []

    for (const position of targetPositions) {
      try {
        const claimTxs = await sdk.fee.getClaimTransaction(keypair.publicKey, position)

        if (!claimTxs || claimTxs.length === 0) continue

        for (const tx of claimTxs) {
          try {
            const sig = await signAndSendTransaction(connection, 'processed', tx, keypair)
            signatures.push(sig)
            console.log('Claimed! Signature:', sig)
          } catch (txErr: any) {
            console.error('Tx failed:', txErr?.message)
          }
        }
      } catch (posErr: any) {
        console.error('Position failed:', posErr?.message)
      }
    }

    return NextResponse.json({
      success: true,
      positions_found: targetPositions.length,
      transactions_sent: signatures.length,
      signatures,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
