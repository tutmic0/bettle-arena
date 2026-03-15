import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')
    const arena_id = searchParams.get('arena_id')

    if (!wallet || !arena_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const { data: predictions, error } = await supabaseAdmin
      .from('predictions')
      .select(`
        *,
        matches(
          round,
          coin_a_mint,
          coin_b_mint,
          winner_mint,
          status
        )
      `)
      .eq('wallet_address', wallet)
      .eq('arena_id', arena_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: coins } = await supabaseAdmin
      .from('arena_coins')
      .select('token_mint, name, symbol, image_url')
      .eq('arena_id', arena_id)

    const coinMap: { [mint: string]: any } = {}
    coins?.forEach(c => { coinMap[c.token_mint] = c })

    return NextResponse.json({ predictions, coinMap })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}