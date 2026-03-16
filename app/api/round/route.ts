import { NextResponse } from 'next/server'
import { getCurrentRound, getUpcomingRound } from '@/lib/rounds'

export async function GET() {
  try {
    const current = await getCurrentRound()
    const upcoming = await getUpcomingRound()
    return NextResponse.json({ round: current, upcomingRound: upcoming })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch round' }, { status: 500 })
  }
}