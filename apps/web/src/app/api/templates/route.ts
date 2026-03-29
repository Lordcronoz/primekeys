import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, updateTemplates } from '@/lib/backend/firestore'
import { requireAuth, requireTeam } from '@/lib/backend/auth'
import Joi from 'joi'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult.error
  const teamError = requireTeam(authResult.ctx)
  if (teamError) return teamError

  try {
    const templates = await getTemplates()
    return NextResponse.json(templates)
  } catch (err) {
    console.error('getTemplates error:', err)
    return NextResponse.json({ message: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult.error
  const teamError = requireTeam(authResult.ctx)
  if (teamError) return teamError

  try {
    const body = await req.json()
    const schema = Joi.object({
      automation: Joi.array().items(Joi.object({
        id:     Joi.string().required(),
        trigger: Joi.string().required(),
        color:  Joi.string().required(),
        body:   Joi.string().required(),
      })).optional(),
    })
    const { error, value } = schema.validate(body)
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })
    await updateTemplates(value)
    return NextResponse.json({ message: 'Templates updated' })
  } catch (err) {
    console.error('updateTemplates error:', err)
    return NextResponse.json({ message: 'Failed to update templates' }, { status: 500 })
  }
}
