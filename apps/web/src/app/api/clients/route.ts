import { NextRequest, NextResponse } from 'next/server'
import { getClients } from '@/lib/backend/firestore'
import { requireAuth, requireTeam } from '@/lib/backend/auth'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult.error
  const teamError = requireTeam(authResult.ctx)
  if (teamError) return teamError

  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (err) {
    console.error('getClients error:', err)
    return NextResponse.json({ message: 'Failed to fetch clients' }, { status: 500 })
  }
}
