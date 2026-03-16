import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, round_id, predictions } = await req.json()

    if (!wallet_address || !round_id || !predictions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const inserts = predictions.map((p: any) => ({
      round_id,
      match_id: p.match_id,
      wallet_address,
      predicted_winner_mint: p.predicted_winner_mint,
    }))

    const { error } = await supabaseAdmin
      .from('round_predictions')
      .upsert(inserts, { onConflict: 'match_id,wallet_address' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')
    const round_id = searchParams.get('round_id')

    if (!wallet || !round_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const { data } = await supabaseAdmin
      .from('round_predictions')
      .select('*')
      .eq('wallet_address', wallet)
      .eq('round_id', round_id)

    return NextResponse.json({ predictions: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}