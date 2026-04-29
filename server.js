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

function serializeWishItem(item) {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    category: item.category,
    priority: item.priority,
    done: item.done,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function isGoalLate(goal) {
  if (goal.status !== 'active') return false
  if (!goal.dueDate) return false
  const due = new Date(goal.dueDate)
  if (Number.isNaN(due.getTime())) return false
  return due.getTime() < startOfToday().getTime()
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

function normalizeWishPriority(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (value === 'baixa' || value === 'alta') return value
  return 'media'
}

function normalizeDateKey(raw) {
  if (typeof raw !== 'string') return ''
  const value = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  return value
}

function normalizeHttpUrl(raw) {
  if (typeof raw !== 'string') return ''
  const value = raw.trim()
  if (!value) return ''
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

function isLikelyLogoUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return true
  const value = raw.toLowerCase()
  return (
    value.includes('favicon') ||
    value.includes('apple-touch-icon') ||
    value.includes('/logo') ||
    value.includes('logo.') ||
    value.includes('/icon') ||
    value.includes('icon.') ||
    value.includes('s2/favicons')
  )
}

function decodeHtmlEntities(text) {
  if (typeof text !== 'string' || !text) return ''
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function absolutizeUrl(candidate, baseUrl) {
  if (typeof candidate !== 'string') return ''
  const value = decodeHtmlEntities(candidate).trim()
  if (!value) return ''
  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return ''
  }
}

function extractMetaContent(html, names = []) {
  if (typeof html !== 'string' || !html) return ''
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const byProperty = new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      'i',
    )
    const byName = new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i')
    const inverseProperty = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*property=["']${escaped}["'][^>]*>`,
      'i',
    )
    const inverseName = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${escaped}["'][^>]*>`,
      'i',
    )
    const match =
      html.match(byProperty)?.[1] ||
      html.match(byName)?.[1] ||
      html.match(inverseProperty)?.[1] ||
      html.match(inverseName)?.[1] ||
      ''
    if (match) return match
  }
  return ''
}

function extractJsonLdImage(html, baseUrl) {
  if (typeof html !== 'string' || !html) return ''
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const block of blocks) {
    const raw = block?.[1]
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const node of candidates) {
        const type = String(node?.['@type'] || '').toLowerCase()
        if (!type.includes('product')) continue
        const image = node?.image
        const imageValue = Array.isArray(image) ? image[0] : image
        const normalized = absolutizeUrl(String(imageValue || ''), baseUrl)
        if (normalized && !isLikelyLogoUrl(normalized)) return normalized
      }
    } catch {
      // ignore invalid json-ld block
    }
  }
  return ''
}

function extractDomainImage(html, baseUrl) {
  const host = new URL(baseUrl).hostname.replace(/^www\./i, '').toLowerCase()

  if (host.includes('amazon.')) {
    const hiRes =
      html.match(/"hiRes"\s*:\s*"([^"]+)"/i)?.[1] ||
      html.match(/"large"\s*:\s*"([^"]+)"/i)?.[1] ||
      html.match(/"landingImageUrl"\s*:\s*"([^"]+)"/i)?.[1] ||
      ''
    const normalized = absolutizeUrl(hiRes.replace(/\\\//g, '/'), baseUrl)
    if (normalized && !isLikelyLogoUrl(normalized)) return normalized
  }

  if (host.includes('kabum.')) {
    const kabumImage =
      extractMetaContent(html, ['og:image', 'twitter:image']) ||
      html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1] ||
      ''
    const normalized = absolutizeUrl(kabumImage.replace(/\\\//g, '/'), baseUrl)
    if (normalized && !isLikelyLogoUrl(normalized)) return normalized
  }

  return ''
}

function extractPriceFromText(text) {
  if (typeof text !== 'string' || !text) return null
  const compact = text.replace(/\s+/g, ' ')
  const patterns = [
    /R\$\s?\d{1,3}(?:\.\d{3})*,\d{2}/i,
    /USD\s?\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/i,
    /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/i,
    /€\s?\d{1,3}(?:\.\d{3})*,\d{2}/i,
  ]
  for (const pattern of patterns) {
    const match = compact.match(pattern)
    if (match?.[0]) return match[0].trim()
  }
  return null
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

function dateKeyFromDateLike(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length >= 10) return trimmed.slice(0, 10)
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
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

  // Garante consistência: metas ativas com prazo já passado viram "late".
  await prisma.goal.updateMany({
    where: {
      userId,
      status: 'active',
      dueDate: { lt: startOfToday() },
    },
    data: { status: 'late' },
  })

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  const prefix = currentMonthPrefix()
  const doneRows = await prisma.dayDemand.findMany({
    where: { userId, done: true, dateKey: { startsWith: prefix } },
    select: { category: true, dateKey: true },
  })

  const computed = goals.map((goal) => {
    const categoryKey = normalizeCategory(goal.category)
    const dueDateKey = goal.dueDate ? dateKeyFromDateLike(goal.dueDate) : null
    const doneCount = doneRows.reduce((count, row) => {
      if (normalizeCategory(row.category) !== categoryKey) return count
      if (dueDateKey && row.dateKey > dueDateKey) return count
      return count + 1
    }, 0)
    const target = Math.max(1, goal.targetCount)
    const progress = Math.min(100, Math.round((doneCount / target) * 100))
    const computedStatus = isGoalLate(goal) ? 'late' : goal.status
    return { ...goal, progress, status: computedStatus }
  })

  const filtered = status ? computed.filter((goal) => goal.status === status) : computed
  res.json({ goals: filtered.map(serializeGoal) })
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

app.get('/api/wishlist', async (req, res) => {
  const userId = readUserId(req.query.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  const items = await prisma.wishItem.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  res.json({ items: items.map(serializeWishItem) })
})

app.post('/api/wishlist', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  const link = typeof req.body?.link === 'string' ? req.body.link.trim() : ''
  const category = normalizeCategory(req.body?.category)
  const priority = normalizeWishPriority(req.body?.priority)
  if (!title) return res.status(400).json({ error: 'titulo e obrigatorio' })
  if (!link) return res.status(400).json({ error: 'link e obrigatorio' })

  const last = await prisma.wishItem.findFirst({
    where: { userId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const item = await prisma.wishItem.create({
    data: {
      userId,
      title,
      link,
      category,
      priority,
      done: false,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  })

  res.status(201).json({ item: serializeWishItem(item) })
})

app.patch('/api/wishlist/:wishItemId', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  const wishItemId = typeof req.params.wishItemId === 'string' ? req.params.wishItemId : ''
  if (!wishItemId) return res.status(400).json({ error: 'wishItemId is required' })

  const existing = await prisma.wishItem.findUnique({ where: { id: wishItemId } })
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'item de desejo nao encontrado' })
  }

  const data = {}
  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim()
    if (!title) return res.status(400).json({ error: 'titulo invalido' })
    data.title = title
  }
  if (typeof req.body?.link === 'string') {
    const link = req.body.link.trim()
    if (!link) return res.status(400).json({ error: 'link invalido' })
    data.link = link
  }
  if (typeof req.body?.category === 'string') {
    data.category = normalizeCategory(req.body.category)
  }
  if (typeof req.body?.priority === 'string') {
    data.priority = normalizeWishPriority(req.body.priority)
  }
  if (req.body?.done !== undefined) {
    data.done = Boolean(req.body.done)
  }
  if (req.body?.sortOrder !== undefined) {
    const sortOrder = Number(req.body.sortOrder)
    if (!Number.isFinite(sortOrder)) return res.status(400).json({ error: 'sortOrder invalido' })
    data.sortOrder = Math.max(0, Math.round(sortOrder))
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'nenhum campo para atualizar' })
  }

  const item = await prisma.wishItem.update({
    where: { id: wishItemId },
    data,
  })

  res.json({ item: serializeWishItem(item) })
})

app.delete('/api/wishlist/:wishItemId', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  const wishItemId = typeof req.params.wishItemId === 'string' ? req.params.wishItemId : ''
  if (!wishItemId) return res.status(400).json({ error: 'wishItemId is required' })

  const existing = await prisma.wishItem.findUnique({ where: { id: wishItemId } })
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'item de desejo nao encontrado' })
  }

  await prisma.wishItem.delete({ where: { id: wishItemId } })
  res.json({ ok: true })
})

app.get('/api/link-preview', async (req, res) => {
  const targetUrl = normalizeHttpUrl(req.query.url)
  if (!targetUrl) return res.status(400).json({ error: 'url invalida' })

  let logoUrl = ''
  let priceText = null
  let imageUrl = ''
  let pageHtml = ''

  try {
    const metaRes = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=false`,
    )
    if (metaRes.ok) {
      const meta = await metaRes.json()
      logoUrl = meta?.data?.logo?.url || ''
      const metaImage = meta?.data?.image?.url || ''
      if (metaImage && !isLikelyLogoUrl(metaImage)) imageUrl = metaImage
      priceText =
        extractPriceFromText(meta?.data?.description || '') ||
        extractPriceFromText(meta?.data?.title || '')
    }
  } catch {
    // no-op
  }

  if (!priceText) {
    try {
      const pageRes = await fetch(targetUrl, {
        headers: { 'user-agent': 'Mozilla/5.0 TickBot/1.0' },
      })
      if (pageRes.ok) {
        pageHtml = await pageRes.text()
        if (!priceText) priceText = extractPriceFromText(pageHtml)
      }
    } catch {
      // no-op
    }
  }

  if (pageHtml && !imageUrl) {
    const fromOg = absolutizeUrl(
      extractMetaContent(pageHtml, ['og:image:secure_url', 'og:image', 'twitter:image']),
      targetUrl,
    )
    if (fromOg && !isLikelyLogoUrl(fromOg)) imageUrl = fromOg
  }

  if (pageHtml && !imageUrl) {
    imageUrl = extractJsonLdImage(pageHtml, targetUrl) || ''
  }

  if (pageHtml && !imageUrl) {
    imageUrl = extractDomainImage(pageHtml, targetUrl) || ''
  }

  if (!priceText) {
    try {
      const mirrorRes = await fetch(`https://r.jina.ai/http://${targetUrl.replace(/^https?:\/\//, '')}`)
      if (mirrorRes.ok) {
        const mirrorText = await mirrorRes.text()
        priceText = extractPriceFromText(mirrorText)
      }
    } catch {
      // no-op
    }
  }

  try {
    const host = new URL(targetUrl).hostname
    const cleanHost = host.replace(/^www\./i, '')
    const horseIcon = `https://icon.horse/icon/${encodeURIComponent(cleanHost)}`
    if (!logoUrl || /\.ico($|\?)/i.test(logoUrl)) {
      logoUrl = horseIcon
    }
  } catch {
    if (!logoUrl) logoUrl = ''
  }

  res.json({ logoUrl, priceText, imageUrl })
})

app.get('/api/hydration', async (req, res) => {
  const userId = readUserId(req.query.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  const dateKey = normalizeDateKey(req.query.dateKey)
  if (!dateKey) return res.status(400).json({ error: 'dateKey invalido' })

  const row = await prisma.dailyHydration.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
    select: { cups: true },
  })

  res.json({ cups: row?.cups ?? 0 })
})

app.put('/api/hydration', async (req, res) => {
  const userId = readUserId(req.body?.userId)
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  const dateKey = normalizeDateKey(req.body?.dateKey)
  if (!dateKey) return res.status(400).json({ error: 'dateKey invalido' })

  const cupsRaw = Number(req.body?.cups)
  if (!Number.isFinite(cupsRaw)) return res.status(400).json({ error: 'cups invalido' })
  const cups = Math.max(0, Math.min(3, Math.round(cupsRaw)))

  const row = await prisma.dailyHydration.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    update: { cups },
    create: { userId, dateKey, cups },
  })

  res.json({ cups: row.cups })
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
