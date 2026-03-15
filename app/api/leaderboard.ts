import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const arena_id = searchParams.get('arena_id')

    const query = supabaseAdmin
      .from('leaderboard')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(10)

    if (arena_id) {
      query.eq('arena_id', arena_id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leaderboard: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}