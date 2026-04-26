import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const app = express()
const port = process.env.PORT || 4000
const prisma = new PrismaClient()
const scrypt = promisify(scryptCallback)

app.use(cors())
app.use(express.json())

function sanitizeEmail(raw) {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : ''
}

function sanitizeName(raw) {
  return typeof raw === 'string' ? raw.trim() : ''
}

function hasFirstAndLastName(name) {
  const parts = sanitizeName(name)
    .split(/\s+/)
    .filter(Boolean)
  return parts.length >= 2 && parts[0].length >= 2 && parts[parts.length - 1].length >= 2
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `${salt}:${Buffer.from(derived).toString('hex')}`
}

async function verifyPassword(password, storedHash) {
  const [salt, hashHex] = String(storedHash || '').split(':')
  if (!salt || !hashHex) return false
  const derived = await scrypt(password, salt, 64)
  const storedBuffer = Buffer.from(hashHex, 'hex')
  const derivedBuffer = Buffer.from(derived)
  if (storedBuffer.length !== derivedBuffer.length) return false
  return timingSafeEqual(storedBuffer, derivedBuffer)
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
})

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const name = sanitizeName(req.body?.name)
  const email = sanitizeEmail(req.body?.email)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' })
  }
  if (!hasFirstAndLastName(name)) {
    return res.status(400).json({ error: 'first and last name are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' })
  }

  const passwordHash = await hashPassword(password)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    })

    res.status(201).json(serializeUser(user))
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'email already in use' })
    }
    throw error
  }
})

app.post('/api/auth/register', async (req, res) => {
  const name = sanitizeName(req.body?.name)
  const email = sanitizeEmail(req.body?.email)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'nome, email e senha sao obrigatorios' })
  }
  if (!hasFirstAndLastName(name)) {
    return res.status(400).json({ error: 'nome e sobrenome sao obrigatorios' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'senha deve ter ao menos 6 caracteres' })
  }

  const passwordHash = await hashPassword(password)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    })
    return res.status(201).json({ user: serializeUser(user) })
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'email ja cadastrado' })
    }
    throw error
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = sanitizeEmail(req.body?.email)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!email || !password) {
    return res.status(400).json({ error: 'email e senha sao obrigatorios' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'email ou senha invalidos' })
  }

  const passwordOk = await verifyPassword(password, user.password)
  if (!passwordOk) {
    return res.status(401).json({ error: 'email ou senha invalidos' })
  }

  return res.json({ user: serializeUser(user) })
})

app.get('/api/items', async (req, res) => {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

app.post('/api/items', async (req, res) => {
  const { title, description } = req.body
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }

  const item = await prisma.item.create({
    data: {
      title,
      description: description || null,
    },
  })

  res.status(201).json(item)
})

function parseYearMonth(yearRaw, monthRaw) {
  const year = Number.parseInt(String(yearRaw), 10)
  const month = Number.parseInt(String(monthRaw), 10)
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null
  }
  return { year, month }
}

function monthPrefix(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-`
}

function readUserId(raw) {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : ''
}

/** Lista demandas do mês agrupadas por dateKey (YYYY-MM-DD). */
app.get('/api/day-demands', async (req, res) => {
  const userId = readUserId(req.query.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const parsed = parseYearMonth(req.query.year, req.query.month)
  if (!parsed) {
    return res.status(400).json({ error: 'year and month (1-12) are required' })
  }
  const { year, month } = parsed
  const prefix = `${year}-${String(month).padStart(2, '0')}-`
  const lastDay = new Date(year, month, 0).getDate()
  const start = `${prefix}01`
  const end = `${prefix}${String(lastDay).padStart(2, '0')}`

  const rows = await prisma.dayDemand.findMany({
    where: { userId, dateKey: { gte: start, lte: end } },
    orderBy: [{ dateKey: 'asc' }, { sortOrder: 'asc' }],
  })

  const byDate = {}
  for (const row of rows) {
    if (!byDate[row.dateKey]) byDate[row.dateKey] = []
    byDate[row.dateKey].push({
      title: row.title,
      note: row.note,
      done: row.done,
    })
  }

  res.json({ byDate })
})

/** Substitui todas as demandas do mês pelos dados enviados (por dia). */
app.put('/api/day-demands', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const parsed = parseYearMonth(req.body?.year, req.body?.month)
  if (!parsed) {
    return res.status(400).json({ error: 'year and month (1-12) are required' })
  }
  const { year, month } = parsed
  const prefix = monthPrefix(year, month)
  const byDate = req.body?.byDate
  if (typeof byDate !== 'object' || byDate === null) {
    return res.status(400).json({ error: 'byDate object is required' })
  }

  const rows = []
  for (const [dateKey, items] of Object.entries(byDate)) {
    if (!dateKey.startsWith(prefix)) {
      return res.status(400).json({ error: `Invalid dateKey for month: ${dateKey}` })
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: `byDate.${dateKey} must be an array` })
    }
    items.forEach((raw, sortOrder) => {
      const title = typeof raw?.title === 'string' ? raw.title.trim() : ''
      if (!title) return
      rows.push({
        userId,
        dateKey,
        title,
        note: typeof raw?.note === 'string' ? raw.note : '',
        done: Boolean(raw?.done),
        sortOrder,
      })
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.dayDemand.deleteMany({
      where: { userId, dateKey: { startsWith: prefix } },
    })
    if (rows.length > 0) {
      await tx.dayDemand.createMany({ data: rows })
    }
  })

  res.json({ ok: true })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
