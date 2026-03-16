import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance } from '@/lib/helius'
import { getTradeQuote } from '@/lib/bags'

const ARENA_TOKEN_MINT = process.env.ARENA_TOKEN_MINT || null
const MIN_SOL_VALUE = parseFloat(process.env.ARENA_MIN_SOL_VALUE || '0.2')

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json({ error: 'Missing wallet' }, { status: 400 })
    }

    if (!ARENA_TOKEN_MINT) {
      return NextResponse.json({
        eligible: true,
        balance: 0,
        sol_value: 0,
        required_sol: MIN_SOL_VALUE,
        launched: false
      })
    }

    const balance = await getTokenBalance(wallet, ARENA_TOKEN_MINT)

    // getTradeQuote vraća koliko ARENA tokena za 1 SOL
    // Trebamo obrnuto — koliko SOL vrijedi tvoj balance
    const quote = await getTradeQuote(ARENA_TOKEN_MINT)
    const arenaPerSol = quote?.inAmount && quote?.outAmount
      ? quote.outAmount / quote.inAmount
      : 0

    const solValue = arenaPerSol > 0 ? balance / arenaPerSol : 0
    const eligible = solValue >= MIN_SOL_VALUE

    return NextResponse.json({
      eligible,
      balance,
      sol_value: solValue,
      price_per_sol: arenaPerSol,
      required_sol: MIN_SOL_VALUE,
      launched: true
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
  }
}
