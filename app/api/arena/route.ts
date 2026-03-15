import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: arena, error } = await supabaseAdmin
      .from('arenas')
      .select(`
        *,
        arena_coins(*),
        matches(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !arena) {
      return NextResponse.json({ arena: null })
    }

    return NextResponse.json({ arena })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch arena' }, { status: 500 })
  }
}