import { NextRequest, NextResponse } from 'next/server'
import { updateClient } from '@/lib/backend/firestore'
import { requireAuth, requireTeam } from '@/lib/backend/auth'
import { renewSchema } from '@/lib/backend/validate'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)
    if (authResult.error) return authResult.error
    const teamError = requireTeam(authResult.ctx)
    if (teamError) return teamError

    const body = await req.json()
    const { error } = renewSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const { clientId, newExpiry, charge } = body
    await updateClient(clientId, { expiryDate: newExpiry, charge, status: 'active' })
    return NextResponse.json({ message: 'Subscription renewed' })
  } catch (err) {
    console.error('renew error:', err)
    return NextResponse.json({ message: 'Failed to renew' }, { status: 500 })
  }
}
