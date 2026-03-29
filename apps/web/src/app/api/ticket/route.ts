import { NextRequest, NextResponse } from 'next/server'
import { createTicket } from '@/lib/backend/firestore'
import { requireAuth } from '@/lib/backend/auth'
import { ticketSchema } from '@/lib/backend/validate'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)
    if (authResult.error) return authResult.error

    const body = await req.json()
    const { error } = ticketSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const ticketId = await createTicket(body)
    return NextResponse.json({ message: 'Ticket created', ticketId }, { status: 201 })
  } catch (err) {
    console.error('createTicket error:', err)
    return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 })
  }
}
