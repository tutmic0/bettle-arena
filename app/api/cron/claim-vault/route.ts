import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, VersionedTransaction, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

const BAGS_API_URL = 'https://public-api-v2.bags.fm/api/v1'

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

    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))
    const walletAddress = keypair.publicKey.toBase58()
    const connection = new Connection(RPC_URL, 'confirmed')

    // Korak 1 — Dohvati claimable pozicije za treasury wallet
    const positionsRes = await fetch(
      `${BAGS_API_URL}/token-launch/claimable-positions?wallet=${walletAddress}`,
      { headers: { 'x-api-key': BAGS_API_KEY } }
    )

    const positionsData = await positionsRes.json()

    if (!positionsData.success || !positionsData.response?.length) {
      return NextResponse.json({ message: 'No claimable positions found' })
    }

    // Filtriraj za $ARENA token
    const targetPositions = positionsData.response.filter(
      (p: any) => p.baseMint === ARENA_TOKEN_MINT
    )

    if (targetPositions.length === 0) {
      return NextResponse.json({ message: 'No claimable positions for ARENA token' })
    }

    const signatures: string[] = []

    // Korak 2 — Za svaku poziciju dohvati claim transakcije
    for (const position of targetPositions) {
      try {
        const claimRes = await fetch(
          `${BAGS_API_URL}/token-launch/claim-transactions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': BAGS_API_KEY,
            },
            body: JSON.stringify({
              wallet: walletAddress,
              position,
            }),
          }
        )

        const claimData = await claimRes.json()

        if (!claimData.success || !claimData.response?.length) continue

        // Korak 3 — Potpiši i pošalji svaku transakciju
        for (const txBase64 of claimData.response) {
          try {
            const txBuffer = Buffer.from(txBase64, 'base64')

            let signature: string

            try {
              // Pokušaj kao VersionedTransaction
              const tx = VersionedTransaction.deserialize(txBuffer)
              tx.sign([keypair])
              signature = await connection.sendTransaction(tx, { skipPreflight: false })
            } catch {
              // Fallback na legacy Transaction
              const tx = Transaction.from(txBuffer)
              tx.partialSign(keypair)
              signature = await connection.sendRawTransaction(tx.serialize())
            }

            await connection.confirmTransaction(signature, 'confirmed')
            signatures.push(signature)

          } catch (txErr: any) {
            console.error('Transaction failed:', txErr?.message)
          }
        }
      } catch (posErr: any) {
        console.error('Position claim failed:', posErr?.message)
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
