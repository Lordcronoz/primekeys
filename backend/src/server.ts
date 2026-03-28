import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { generalLimiter } from './middleware/rateLimit'
import ordersRouter   from './routes/orders'
import paymentsRouter from './routes/payments'
import portalRouter   from './routes/portal'
import activateRouter from './routes/activate'
import paypalRouter   from './routes/paypal'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────
app.use(helmet())
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))
app.use(generalLimiter)

// ── Health check ────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'PRIMEKEYS API', ts: new Date().toISOString() })
})

// ── Routes ──────────────────────────────────────────────
app.use('/api', ordersRouter)
app.use('/api', paymentsRouter)
app.use('/api', portalRouter)
app.use('/api', activateRouter)
app.use('/api', paypalRouter)

// ── 404 ─────────────────────────────────────────────────
app.use((_, res) => {
  res.status(404).json({ message: 'Not found' })
})

// ── Error handler ───────────────────────────────────────
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.message?.startsWith('CORS:')) {
    res.status(403).json({ message: 'Origin not allowed' })
    return
  }
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`PRIMEKEYS API running on port ${PORT}`)
})

export default app