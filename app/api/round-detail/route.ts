import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const round_id = searchParams.get('round_id')

    if (!round_id) {
      return NextResponse.json({ error: 'Missing round_id' }, { status: 400 })
    }

    const { data } = await supabaseAdmin
      .from('round_coins')
      .select('*')
      .eq('round_id', round_id)

    return NextResponse.json({ coins: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}