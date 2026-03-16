import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Dohvati aktivnu arenu
    const { data: activeArena } = await supabaseAdmin
      .from('arenas')
      .select('*, arena_coins(*), matches(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Dohvati upcoming arenu
    const { data: upcomingArena } = await supabaseAdmin
      .from('arenas')
      .select('*, arena_coins(*), matches(*)')
      .eq('status', 'upcoming')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ 
      arena: activeArena || null,
      upcomingArena: upcomingArena || null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch arena' }, { status: 500 })
  }
}
