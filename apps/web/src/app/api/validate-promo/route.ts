import { NextRequest, NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/backend/firestore'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || code.length < 3) return NextResponse.json({ valid: false, discount: 0 })
    const result = await validateReferralCode(code)
    return NextResponse.json(result)
  } catch (err) {
    console.error('validatePromo error:', err)
    return NextResponse.json({ message: 'Failed to validate code' }, { status: 500 })
  }
}
