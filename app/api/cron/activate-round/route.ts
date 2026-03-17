import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('rounds')
      .update({ status: 'active' })
      .eq('status', 'predicting')
      .lte('prediction_closes_at', now)
      .select()

    return NextResponse.json({ success: true, activated: data?.length || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
