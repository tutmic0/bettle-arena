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

    // Dohvati claim transakcije v3 — samo feeClaimer i tokenMint
    const claimRes = await fetch(`${BAGS_API_URL}/token-launch/claim-txs/v3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': BAGS_API_KEY,
      },
      body: JSON.stringify({
        feeClaimer: walletAddress,
        tokenMint: ARENA_TOKEN_MINT,
      }),
    })

    const claimData = await claimRes.json()

    if (!claimData.success || !claimData.response?.length) {
      return NextResponse.json({ message: 'Nothing to claim', data: claimData })
    }

    const signatures: string[] = []

    // Potpiši i pošalji svaku transakciju
    for (const item of claimData.response) {
      try {
        const txBuffer = Buffer.from(item.tx, 'base64')

        let signature: string

        try {
          const tx = VersionedTransaction.deserialize(txBuffer)
          tx.sign([keypair])
          signature = await connection.sendTransaction(tx, {
            skipPreflight: false,
            maxRetries: 3,
          })
        } catch {
          const tx = Transaction.from(txBuffer)
          tx.partialSign(keypair)
          signature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
          })
        }

        await connection.confirmTransaction({
          signature,
          blockhash: item.blockhash.blockhash,
          lastValidBlockHeight: item.blockhash.lastValidBlockHeight,
        }, 'confirmed')

        signatures.push(signature)
        console.log('Claimed! Tx:', signature)

      } catch (txErr: any) {
        console.error('Transaction failed:', txErr?.message)
      }
    }

    return NextResponse.json({
      success: true,
      transactions_sent: signatures.length,
      signatures,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Claim vault failed' }, { status: 500 })
  }
}
