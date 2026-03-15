import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance } from '@/lib/helius'

const ARENA_TOKEN_MINT = process.env.ARENA_TOKEN_MINT || null
const MIN_BALANCE = parseInt(process.env.ARENA_MIN_BALANCE || '1000')

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json({ error: 'Missing wallet' }, { status: 400 })
    }

    // Ako token nije lansiran još, svi su eligible
    if (!ARENA_TOKEN_MINT) {
      return NextResponse.json({ eligible: true, balance: 0, required: MIN_BALANCE, launched: false })
    }

    const balance = await getTokenBalance(wallet, ARENA_TOKEN_MINT)
    const eligible = balance >= MIN_BALANCE

    return NextResponse.json({ eligible, balance, required: MIN_BALANCE, launched: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
  }
}
