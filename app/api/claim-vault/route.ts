import { NextRequest, NextResponse } from 'next/server'
import { Keypair, Connection, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
const BAGS_API_KEY = process.env.BAGS_API_KEY!
const BAGS_API_URL = 'https://public-api-v2.bags.fm/api/v1'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const privateKeyBytes = bs58.decode(process.env.TREASURY_PRIVATE_KEY!)
    const treasuryKeypair = Keypair.fromSecretKey(privateKeyBytes)
    const walletAddress = treasuryKeypair.publicKey.toString()

    // Dohvati claimable positions
    const positionsRes = await fetch(
      `${BAGS_API_URL}/fees/claimable-positions?wallet=${walletAddress}`,
      { headers: { 'x-api-key': BAGS_API_KEY } }
    )
    const positions = await positionsRes.json()

    if (!positions.response || positions.response.length === 0) {
      return NextResponse.json({ message: 'Nothing to claim' })
    }

    // Kreiraj claim transakcije
    const claimRes = await fetch(`${BAGS_API_URL}/fees/claim-transactions`, {
      method: 'POST',
      headers: {
        'x-api-key': BAGS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet: walletAddress,
        positions: positions.response,
      }),
    })

    const claimData = await claimRes.json()

    if (!claimData.response) {
      return NextResponse.json({ error: 'Failed to get claim transactions' }, { status: 500 })
    }

    // Potpiši i pošalji transakcije
    const connection = new Connection(HELIUS_URL, 'confirmed')
    const signatures = []

    for (const txBase64 of claimData.response) {
      const txBuffer = Buffer.from(txBase64, 'base64')
      const transaction = Transaction.from(txBuffer)
      transaction.partialSign(treasuryKeypair)
      const signature = await connection.sendRawTransaction(transaction.serialize())
      await connection.confirmTransaction(signature, 'confirmed')
      signatures.push(signature)
    }

    return NextResponse.json({ success: true, signatures })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}