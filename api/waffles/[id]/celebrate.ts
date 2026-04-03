import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  ensureWaffleTables,
  getPool,
  getWaffleRowById,
  hasDatabaseConfig,
  mapWaffleRowToDomain,
} from '../../_lib/wafflesDb.js'

type CelebrateRequestBody = {
  browserToken?: unknown
}

const readBody = (request: VercelRequest) => {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as CelebrateRequestBody
  }

  return (request.body ?? {}) as CelebrateRequestBody
}

const readWaffleId = (request: VercelRequest) => {
  const { id } = request.query

  if (Array.isArray(id)) {
    return id[0] ?? ''
  }

  return typeof id === 'string' ? id : ''
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

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const waffleId = readWaffleId(request)
  const { browserToken } = readBody(request)
  const normalizedBrowserToken =
    typeof browserToken === 'string' ? browserToken.trim() : ''

  if (!waffleId) {
    return response.status(400).json({ error: 'A waffle id is required.' })
  }

  if (!normalizedBrowserToken) {
    return response.status(400).json({
      error: 'A browser token is required to celebrate a waffle.',
    })
  }

  try {
    await ensureWaffleTables()
    const pool = getPool()
    const existingWaffle = await getWaffleRowById(waffleId)

    if (!existingWaffle) {
      return response.status(404).json({
        error: 'That waffle could not be found.',
      })
    }

    await pool.query(
      `
        INSERT INTO waffle_celebrations (waffle_id, browser_token, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (waffle_id, browser_token) DO NOTHING
      `,
      [waffleId, normalizedBrowserToken]
    )

    const waffle = await getWaffleRowById(waffleId)

    return response.status(200).json({
      waffle: mapWaffleRowToDomain(waffle),
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to celebrate that waffle right now.'

    return response.status(500).json({
      error: message,
    })
  }
}
