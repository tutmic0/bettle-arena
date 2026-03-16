import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data } = await supabaseAdmin
      .from('daily_leaderboard')
      .select('*')
      .eq('date', date)
      .order('total_points', { ascending: false })
      .limit(50)

    return NextResponse.json({ leaderboard: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}