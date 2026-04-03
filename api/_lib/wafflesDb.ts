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
  celebration_count: number
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null

export const hasDatabaseConfig = Boolean(connectionString)

let pool: Pool | null = null
let tableReadyPromise: Promise<void> | null = null

const WAFFLE_SELECT = `
  SELECT
    waffles.id,
    waffles.sender_name,
    waffles.recipient_name,
    waffles.flavor,
    waffles.message,
    waffles.created_at,
    COALESCE(COUNT(waffle_celebrations.waffle_id), 0)::int AS celebration_count
  FROM waffles
  LEFT JOIN waffle_celebrations
    ON waffle_celebrations.waffle_id = waffles.id
`

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

export const ensureWaffleTables = async () => {
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
      .then(() =>
        getPool().query(`
        CREATE TABLE IF NOT EXISTS waffle_celebrations (
          waffle_id TEXT NOT NULL REFERENCES waffles(id) ON DELETE CASCADE,
          browser_token TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (waffle_id, browser_token)
        )
      `)
      )
      .then(() => undefined)
  }

  await tableReadyPromise
}

export const listWaffleRows = async (limit = 100) => {
  const result = await getPool().query<WaffleRow>(
    `
      ${WAFFLE_SELECT}
      GROUP BY
        waffles.id,
        waffles.sender_name,
        waffles.recipient_name,
        waffles.flavor,
        waffles.message,
        waffles.created_at
      ORDER BY waffles.created_at DESC
      LIMIT $1
    `,
    [limit]
  )

  return result.rows
}

export const getWaffleRowById = async (waffleId: string) => {
  const result = await getPool().query<WaffleRow>(
    `
      ${WAFFLE_SELECT}
      WHERE waffles.id = $1
      GROUP BY
        waffles.id,
        waffles.sender_name,
        waffles.recipient_name,
        waffles.flavor,
        waffles.message,
        waffles.created_at
    `,
    [waffleId]
  )

  return result.rows[0] ?? null
}

export const mapWaffleRowToDomain = (row: WaffleRow): Waffle => ({
  id: row.id,
  sender: { name: row.sender_name },
  recipient: { name: row.recipient_name },
  flavor: row.flavor,
  message: row.message,
  createdAt: new Date(row.created_at).toISOString(),
  celebrationCount: row.celebration_count,
})
