import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'
import { type Waffle } from '../../src/domain/waffles.js'

export type WaffleRow = {
  id: string
  sender_name: string
  recipient_name: string
  flavor: Waffle['flavor']
  message: string
  created_at: Date | string
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null

export const hasDatabaseConfig = Boolean(connectionString)

let pool: Pool | null = null
let tableReadyPromise: Promise<void> | null = null

export const getPool = () => {
  if (!connectionString) {
    throw new Error('Database connection is not configured.')
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    })
    attachDatabasePool(pool)
  }

  return pool
}

export const ensureWafflesTable = async () => {
  if (!tableReadyPromise) {
    tableReadyPromise = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS waffles (
          id TEXT PRIMARY KEY,
          sender_name TEXT NOT NULL,
          recipient_name TEXT NOT NULL,
          flavor TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      .then(() => undefined)
  }

  await tableReadyPromise
}

export const mapWaffleRowToDomain = (row: WaffleRow): Waffle => ({
  id: row.id,
  sender: { name: row.sender_name },
  recipient: { name: row.recipient_name },
  flavor: row.flavor,
  message: row.message,
  createdAt: new Date(row.created_at).toISOString(),
})
