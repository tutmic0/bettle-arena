import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance } from '@/lib/helius'
import { getTradeQuote } from '@/lib/bags'

const ARENA_TOKEN_MINT = process.env.ARENA_TOKEN_MINT || null
const MIN_USD_VALUE = parseFloat(process.env.ARENA_MIN_USD_VALUE || '50')

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
        usd_value: 0,
        required_usd: MIN_USD_VALUE,
        launched: false 
      })
    }

    const [balance, quote] = await Promise.all([
      getTokenBalance(wallet, ARENA_TOKEN_MINT),
      getTradeQuote(ARENA_TOKEN_MINT)
    ])

    const price = quote?.price || 0
    const usdValue = balance * price
    const eligible = usdValue >= MIN_USD_VALUE

    return NextResponse.json({ 
      eligible, 
      balance, 
      usd_value: usdValue,
      price,
      required_usd: MIN_USD_VALUE,
      launched: true 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
  }
}