import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { SendWaffleInput } from '../src/domain/waffles.js'
import {
  ensureWaffleTables,
  getWaffleRowById,
  getPool,
  hasDatabaseConfig,
  listWaffleRows,
  mapWaffleRowToDomain,
} from './_lib/wafflesDb.js'

// Keep runtime validation local to the API function so the server bundle does
// not depend on client-side source files being present at execution time.
const WAFFLE_FLAVORS = [
  'Classic Buttermilk',
  'Blueberry Blitz',
  'Chocolate Confetti',
  'Matcha Mingle',
  'Savory Cheddar',
] as const

const isValidInput = (input: Partial<SendWaffleInput>): input is SendWaffleInput =>
  typeof input.senderName === 'string' &&
  input.senderName.trim().length > 0 &&
  typeof input.recipientName === 'string' &&
  input.recipientName.trim().length > 0 &&
  typeof input.message === 'string' &&
  input.message.trim().length > 0 &&
  typeof input.flavor === 'string' &&
  WAFFLE_FLAVORS.includes(input.flavor)

const readBody = (request: VercelRequest) => {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as Partial<SendWaffleInput>
  }

  return (request.body ?? {}) as Partial<SendWaffleInput>
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Content-Type', 'application/json')

  if (!hasDatabaseConfig) {
    return response.status(503).json({
      error:
        'Shared persistence is not configured. Add DATABASE_URL to enable the live team feed.',
    })
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureWaffleTables()
    const pool = getPool()

    if (request.method === 'GET') {
      return response.status(200).json({
        waffles: (await listWaffleRows()).map(mapWaffleRowToDomain),
      })
    }

    const input = readBody(request)

    if (!isValidInput(input)) {
      return response.status(400).json({
        error:
          'A waffle requires a sender, recipient, valid flavor, and message.',
      })
    }

    const result = await pool.query<{ id: string }>(
      `
        INSERT INTO waffles (
          id,
          sender_name,
          recipient_name,
          flavor,
          message,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `,
      [
        randomUUID(),
        input.senderName.trim(),
        input.recipientName.trim(),
        input.flavor,
        input.message.trim(),
      ]
    )

    const waffle = await getWaffleRowById(result.rows[0]?.id ?? '')

    if (!waffle) {
      throw new Error('Unable to load the created waffle right now.')
    }

    return response.status(201).json({
      waffle: mapWaffleRowToDomain(waffle),
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to reach shared persistence right now.'

    return response.status(500).json({
      error: message,
    })
  }
}
