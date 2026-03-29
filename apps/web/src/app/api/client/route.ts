import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/backend/firestore'
import { requireAuth, requireTeam } from '@/lib/backend/auth'
import { clientSchema } from '@/lib/backend/validate'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)
    if (authResult.error) return authResult.error
    const teamError = requireTeam(authResult.ctx)
    if (teamError) return teamError

    const body = await req.json()
    const { error } = clientSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const clientId = await createClient(body)
    return NextResponse.json({ message: 'Client added', clientId }, { status: 201 })
  } catch (err) {
    console.error('createClient error:', err)
    return NextResponse.json({ message: 'Failed to add client' }, { status: 500 })
  }
}
