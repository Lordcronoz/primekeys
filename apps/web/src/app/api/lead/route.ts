import { NextRequest, NextResponse } from 'next/server'
import { createLead } from '@/lib/backend/firestore'
import { requireAuth, requireTeam } from '@/lib/backend/auth'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)
    if (authResult.error) return authResult.error
    const teamError = requireTeam(authResult.ctx)
    if (teamError) return teamError

    const body = await req.json()
    const leadId = await createLead(body)
    return NextResponse.json({ message: 'Lead added', leadId }, { status: 201 })
  } catch (err) {
    console.error('createLead error:', err)
    return NextResponse.json({ message: 'Failed to add lead' }, { status: 500 })
  }
}
