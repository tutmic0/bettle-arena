import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import bs58 from 'bs58'

const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, arena_id } = await req.json()

    if (!wallet_address || !arena_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // Provjeri da li korisnik ima unclaimed nagradu
    const { data: entry, error } = await supabaseAdmin
      .from('leaderboard')
      .select('*')
      .eq('wallet_address', wallet_address)
      .eq('arena_id', arena_id)
      .single()

    if (error || !entry) {
      return NextResponse.json({ error: 'No reward found' }, { status: 404 })
    }

    if (entry.reward_claimed) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
    }

    if (!entry.reward_amount || entry.reward_amount <= 0) {
      return NextResponse.json({ error: 'No reward to claim' }, { status: 400 })
    }

    // Dohvati treasury keypair
    const privateKeyString = process.env.TREASURY_PRIVATE_KEY!
    const privateKeyBytes = bs58.decode(privateKeyString)
    const treasuryKeypair = Keypair.fromSecretKey(privateKeyBytes)

    // Konektaj se na Solana
    const connection = new Connection(HELIUS_URL, 'confirmed')

    // Izračunaj iznos u lamports (reward_amount je % od poola)
    // Trebamo dohvatiti ukupni pool iz treasury balance-a
    const treasuryBalance = await connection.getBalance(treasuryKeypair.publicKey)
    const rewardLamports = Math.floor((entry.reward_amount / 100) * treasuryBalance * 0.8)

    if (rewardLamports <= 0) {
      return NextResponse.json({ error: 'Insufficient treasury balance' }, { status: 400 })
    }

    // Kreiraj i pošalji transakciju
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: new PublicKey(wallet_address),
        lamports: rewardLamports,
      })
    )

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryKeypair]
    )

    // Označi kao claimed u bazi
    await supabaseAdmin
      .from('leaderboard')
      .update({ reward_claimed: true })
      .eq('wallet_address', wallet_address)
      .eq('arena_id', arena_id)

    return NextResponse.json({
      success: true,
      signature,
      amount_lamports: rewardLamports,
    })
  } catch (error: any) {
    console.error('Claim error:', error)
    return NextResponse.json({ error: error.message || 'Claim failed' }, { status: 500 })
  }
}