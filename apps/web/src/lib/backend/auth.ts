import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from './firestore'

const TEAM_ROLES: Record<string, string> = {
  'aaronjthomas.cj@gmail.com':          'founder',
  'nicholsonvargheese81939@gmail.com':  'cofounder',
  'devikaprasannan089@gmail.com':        'team',
  'shayanika7@gmail.com':                'marketing',
}

export interface AuthContext {
  uid?:   string
  email?: string
  role?:  string
}

export async function requireAuth(req: NextRequest): Promise<{ ctx: AuthContext; error?: NextResponse }> {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    return { ctx: {}, error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }
  const token = header.split(' ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return {
      ctx: {
        uid:   decoded.uid,
        email: decoded.email,
        role:  TEAM_ROLES[decoded.email || ''] || 'client',
      },
    }
  } catch {
    return { ctx: {}, error: NextResponse.json({ message: 'Invalid token' }, { status: 401 }) }
  }
}

export function requireTeam(ctx: AuthContext) {
  if (!ctx.role || !['founder', 'cofounder', 'team', 'marketing'].includes(ctx.role)) {
    return NextResponse.json({ message: 'Team access required' }, { status: 403 })
  }
  return null
}

export function requireFounder(ctx: AuthContext) {
  if (ctx.role !== 'founder' && ctx.role !== 'cofounder') {
    return NextResponse.json({ message: 'Founder access required' }, { status: 403 })
  }
  return null
}

export function requireAdmin(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
  }
  return null
}
