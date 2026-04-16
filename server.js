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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
