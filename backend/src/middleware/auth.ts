import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firestore'

export interface AuthRequest extends Request {
  uid?:   string
  email?: string
  role?:  string
}

const TEAM_ROLES: Record<string, string> = {
  'aaronjthomas.cj@gmail.com':        'founder',
  'nicholsonvargheese81939@gmail.com': 'cofounder',
  'devikaprasannan089@gmail.com':      'team',
  'shayanika7@gmail.com':              'marketing',
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const token = header.split(' ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    req.uid   = decoded.uid
    req.email = decoded.email
    req.role  = TEAM_ROLES[decoded.email || ''] || 'client'
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireTeam(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const teamRoles = ['founder', 'cofounder', 'team', 'marketing']
  if (!req.role || !teamRoles.includes(req.role)) {
    res.status(403).json({ message: 'Team access required' })
    return
  }
  next()
}

export function requireFounder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.role !== 'founder' && req.role !== 'cofounder') {
    res.status(403).json({ message: 'Founder access required' })
    return
  }
  next()
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret = req.headers['x-admin-secret']
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ message: 'Admin access required' })
    return
  }
  next()
}