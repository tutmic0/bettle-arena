import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data } = await supabaseAdmin
      .from('rounds')
      .select('id, round_number, status, date')
      .eq('date', date)
      .order('created_at', { ascending: true })

    return NextResponse.json({ rounds: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}