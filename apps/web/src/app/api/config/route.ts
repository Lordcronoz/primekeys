import { NextRequest, NextResponse } from 'next/server'
import { getConfig, updateConfig } from '@/lib/backend/firestore'
import { requireAuth, requireTeam, requireFounder } from '@/lib/backend/auth'
import Joi from 'joi'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult.error
  const teamError = requireTeam(authResult.ctx)
  if (teamError) return teamError

  try {
    const config = await getConfig()
    return NextResponse.json(config)
  } catch (err) {
    console.error('getConfig error:', err)
    return NextResponse.json({ message: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult.error
  const founderError = requireFounder(authResult.ctx)
  if (founderError) return founderError

  try {
    const body = await req.json()
    const schema = Joi.object({
      upiId:          Joi.string().allow('').optional(),
      whatsappNumber: Joi.string().allow('').optional(),
      waApiKey:       Joi.string().allow('').optional(),
      wiseLink:       Joi.string().allow('').optional(),
    })
    const { error, value } = schema.validate(body)
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })
    await updateConfig(value)
    return NextResponse.json({ message: 'Config updated' })
  } catch (err) {
    console.error('updateConfig error:', err)
    return NextResponse.json({ message: 'Failed to update config' }, { status: 500 })
  }
}
