import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const port = process.env.PORT || 4000
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
})

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' })
  }

  const user = await prisma.user.create({
    data: { name, email },
  })

  res.status(201).json(user)
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

/** Lista demandas do mês agrupadas por dateKey (YYYY-MM-DD). */
app.get('/api/day-demands', async (req, res) => {
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
    where: { dateKey: { gte: start, lte: end } },
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
      where: { dateKey: { startsWith: prefix } },
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
