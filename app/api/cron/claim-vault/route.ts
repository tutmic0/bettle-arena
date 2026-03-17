import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { BagsSDK, signAndSendTransaction } from '@bagsfm/bags-sdk'

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

    const connection = new Connection(RPC_URL, 'processed')
    const sdk = new BagsSDK(BAGS_API_KEY, connection, 'processed')
    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))

    // Dohvati sve claimable pozicije za treasury wallet
    const allPositions = await sdk.fee.getAllClaimablePositions(keypair.publicKey)

    if (!allPositions || allPositions.length === 0) {
      return NextResponse.json({ message: 'No claimable positions found' })
    }

    // Filtriraj za $ARENA token
    const targetPositions = allPositions.filter(
      (p: any) => p.baseMint === ARENA_TOKEN_MINT
    )

    if (targetPositions.length === 0) {
      return NextResponse.json({ message: 'No claimable positions for ARENA token' })
    }

    const signatures: string[] = []

    for (const position of targetPositions) {
      try {
        const claimTransactions = await sdk.fee.getClaimTransaction(
          keypair.publicKey,
          position
        )

        if (!claimTransactions || claimTransactions.length === 0) {
          console.log('No transactions generated for position')
          continue
        }

       for (const transaction of claimTransactions) {
  try {
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transaction.feePayer = keypair.publicKey
    transaction.partialSign(keypair)
    
    const sig = await connection.sendRawTransaction(transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }))
    await connection.confirmTransaction(sig, 'confirmed')
    signatures.push(sig)
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
    return NextResponse.json({ error: error.message || 'Claim vault failed' }, { status: 500 })
  }
}
