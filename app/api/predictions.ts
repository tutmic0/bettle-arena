import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, arena_id, predictions } = await req.json()

    if (!wallet_address || !arena_id || !predictions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const inserts = predictions.map((p: any) => ({
      arena_id,
      match_id: p.match_id,
      wallet_address,
      predicted_winner_mint: p.predicted_winner_mint,
    }))

    const { error } = await supabaseAdmin
      .from('predictions')
      .upsert(inserts, { onConflict: 'match_id,wallet_address' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update leaderboard entry
    await supabaseAdmin
      .from('leaderboard')
      .upsert({
        arena_id,
        wallet_address,
        total_predictions: predictions.length,
      }, { onConflict: 'arena_id,wallet_address' })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save predictions' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')
    const arena_id = searchParams.get('arena_id')

    if (!wallet || !arena_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('wallet_address', wallet)
      .eq('arena_id', arena_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ predictions: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
  }
}