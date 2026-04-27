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

function normalizeDemandTime(raw) {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s) return null
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s)
  if (!match) return null
  const h = Number(match[1])
  const min = Number(match[2])
  const sec = match[3] != null ? Number(match[3]) : 0
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(min) ||
    !Number.isFinite(sec) ||
    h < 0 ||
    h > 23 ||
    min < 0 ||
    min > 59 ||
    sec < 0 ||
    sec > 59
  ) {
    return null
  }
  let total = h * 3600 + min * 60 + sec
  if (total >= 24 * 3600) total = 24 * 3600 - 1
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function demandTimeToMinutes(value) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function parseDemandTimeRange(raw) {
  const start = normalizeDemandTime(raw?.startTime)
  const end = normalizeDemandTime(raw?.endTime)
  if (!start || !end) return { startTime: null, endTime: null }
  const a = demandTimeToMinutes(start)
  const b = demandTimeToMinutes(end)
  if (a === null || b === null || a >= b) return { startTime: null, endTime: null }
  return { startTime: start, endTime: end }
}

function readUserId(raw) {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : ''
}

function parseGoalStatus(raw) {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''
  return ['active', 'completed', 'late'].includes(value) ? value : null
}

function serializeGoal(goal) {
  return {
    id: goal.id,
    title: goal.title,
    category: goal.category,
    targetCount: goal.targetCount,
    progress: goal.progress,
    status: goal.status,
    dueDate: goal.dueDate,
    completedAt: goal.completedAt,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }
}

function normalizeCategory(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return value || 'geral'
}

function normalizePriority(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (value === 'baixa' || value === 'importante') return value
  return 'media'
}

function colorFromPriority(priority) {
  if (priority === 'baixa') return '#3b82f6'
  if (priority === 'importante') return '#ef4444'
  return '#f59e0b'
}

function currentMonthPrefix() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`
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
      category: row.category || 'geral',
      note: row.note,
      priority: normalizePriority(row.priority),
      color: row.color || colorFromPriority(normalizePriority(row.priority)),
      startTime: row.startTime,
      endTime: row.endTime,
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
      const { startTime, endTime } = parseDemandTimeRange(raw)
      const priority = normalizePriority(raw?.priority)
      rows.push({
        userId,
        dateKey,
        title,
        category: normalizeCategory(raw?.category),
        note: typeof raw?.note === 'string' ? raw.note : '',
        priority,
        color: colorFromPriority(priority),
        startTime,
        endTime,
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

app.get('/api/goals', async (req, res) => {
  const userId = readUserId(req.query.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const status = parseGoalStatus(req.query.status)
  if (status === null) {
    return res.status(400).json({ error: 'invalid status' })
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  const prefix = currentMonthPrefix()
  const doneRows = await prisma.dayDemand.findMany({
    where: { userId, done: true, dateKey: { startsWith: prefix } },
    select: { category: true },
  })
  const doneByCategory = new Map()
  for (const row of doneRows) {
    const key = normalizeCategory(row.category)
    doneByCategory.set(key, (doneByCategory.get(key) ?? 0) + 1)
  }

  const computed = goals.map((goal) => {
    const doneCount = doneByCategory.get(normalizeCategory(goal.category)) ?? 0
    const target = Math.max(1, goal.targetCount)
    const progress = Math.min(100, Math.round((doneCount / target) * 100))
    return { ...goal, progress }
  })

  res.json({ goals: computed.map(serializeGoal) })
})

app.post('/api/goals', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  if (!title) {
    return res.status(400).json({ error: 'titulo da meta e obrigatorio' })
  }

  const category = normalizeCategory(req.body?.category)
  const targetCountRaw = Number(req.body?.targetCount)
  const targetCount = Number.isFinite(targetCountRaw) ? Math.max(1, Math.round(targetCountRaw)) : 1
  const dueDateRaw = typeof req.body?.dueDate === 'string' ? req.body.dueDate.trim() : ''
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null
  if (dueDateRaw && Number.isNaN(dueDate?.getTime())) {
    return res.status(400).json({ error: 'dueDate invalido' })
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      category,
      targetCount,
      progress: 0,
      status: 'active',
      dueDate,
    },
  })

  res.status(201).json({ goal: serializeGoal(goal) })
})

app.patch('/api/goals/:goalId', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const goalId = typeof req.params.goalId === 'string' ? req.params.goalId : ''
  if (!goalId) {
    return res.status(400).json({ error: 'goalId is required' })
  }

  const existing = await prisma.goal.findUnique({ where: { id: goalId } })
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'meta nao encontrada' })
  }

  const data = {}

  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim()
    if (!title) return res.status(400).json({ error: 'titulo invalido' })
    data.title = title
  }
  if (typeof req.body?.category === 'string') {
    data.category = normalizeCategory(req.body.category)
  }
  if (req.body?.targetCount !== undefined) {
    const targetRaw = Number(req.body.targetCount)
    if (!Number.isFinite(targetRaw)) return res.status(400).json({ error: 'meta alvo invalida' })
    data.targetCount = Math.max(1, Math.round(targetRaw))
  }
  if (req.body?.progress !== undefined) {
    const progressRaw = Number(req.body.progress)
    if (!Number.isFinite(progressRaw)) return res.status(400).json({ error: 'progresso invalido' })
    data.progress = Math.max(0, Math.min(100, Math.round(progressRaw)))
  }
  if (req.body?.status !== undefined) {
    const parsedStatus = parseGoalStatus(req.body.status)
    if (!parsedStatus) return res.status(400).json({ error: 'status invalido' })
    data.status = parsedStatus
  }
  if (req.body?.dueDate !== undefined) {
    if (req.body.dueDate === null || req.body.dueDate === '') {
      data.dueDate = null
    } else if (typeof req.body.dueDate === 'string') {
      const parsedDate = new Date(req.body.dueDate)
      if (Number.isNaN(parsedDate.getTime())) return res.status(400).json({ error: 'dueDate invalido' })
      data.dueDate = parsedDate
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'nenhum campo para atualizar' })
  }

  if (data.progress === 100 && !data.status) {
    data.status = 'completed'
  }

  const nextStatus = data.status ?? existing.status
  const nextProgress = data.progress ?? existing.progress
  const isCompletedState = nextStatus === 'completed' || nextProgress >= 100
  const wasCompleted = existing.status === 'completed' || existing.progress >= 100

  if (isCompletedState) {
    const becameCompleted = !wasCompleted
    if (becameCompleted || !existing.completedAt) {
      data.completedAt = new Date()
    }
  } else {
    data.completedAt = null
  }

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data,
  })

  res.json({ goal: serializeGoal(goal) })
})

app.delete('/api/goals/:goalId', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  const goalId = typeof req.params.goalId === 'string' ? req.params.goalId : ''
  if (!goalId) {
    return res.status(400).json({ error: 'goalId is required' })
  }

  const existing = await prisma.goal.findUnique({ where: { id: goalId } })
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'meta nao encontrada' })
  }

  await prisma.goal.delete({ where: { id: goalId } })
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
