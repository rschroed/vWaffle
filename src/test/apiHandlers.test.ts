import { beforeEach, describe, expect, it, vi } from 'vitest'
import wafflesHandler from '../../api/waffles'
import celebrateHandler from '../../api/waffles/[id]/celebrate'

const {
  ensureWaffleTables,
  listWaffleRows,
  getWaffleRowById,
  query,
} = vi.hoisted(() => ({
  ensureWaffleTables: vi.fn(),
  listWaffleRows: vi.fn(),
  getWaffleRowById: vi.fn(),
  query: vi.fn(),
}))

vi.mock('../../api/_lib/wafflesDb.js', () => ({
  ensureWaffleTables,
  getPool: () => ({ query }),
  getWaffleRowById,
  hasDatabaseConfig: true,
  listWaffleRows,
  mapWaffleRowToDomain: (row: {
    id: string
    sender_name: string
    recipient_name: string
    flavor: string
    message: string
    created_at: string
    celebration_count: number
  }) => ({
    id: row.id,
    sender: { name: row.sender_name },
    recipient: { name: row.recipient_name },
    flavor: row.flavor,
    message: row.message,
    createdAt: row.created_at,
    celebrationCount: row.celebration_count,
  }),
}))

const createResponse = () => {
  const state = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as unknown,
  }

  const response = {
    setHeader: vi.fn((name: string, value: string) => {
      state.headers[name] = value
    }),
    status: vi.fn((code: number) => {
      state.statusCode = code
      return response
    }),
    json: vi.fn((payload: unknown) => {
      state.body = payload
      return response
    }),
  }

  return { response, state }
}

describe('waffles api handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns celebration counts from the list endpoint', async () => {
    listWaffleRows.mockResolvedValue([
      {
        id: 'waffle-001',
        sender_name: 'Ryan',
        recipient_name: 'Priya',
        flavor: 'Classic Buttermilk',
        message: 'For untangling the debugger mystery before coffee.',
        created_at: '2026-03-31T15:00:00.000Z',
        celebration_count: 2,
      },
    ])

    const { response, state } = createResponse()

    await wafflesHandler(
      { method: 'GET', body: null } as never,
      response as never
    )

    expect(ensureWaffleTables).toHaveBeenCalled()
    expect(state.statusCode).toBe(200)
    expect(state.body).toEqual({
      waffles: [
        expect.objectContaining({
          id: 'waffle-001',
          celebrationCount: 2,
        }),
      ],
    })
  })

  it('celebrates a waffle once per browser token and returns the updated count', async () => {
    query.mockResolvedValue({ rows: [] })
    getWaffleRowById.mockResolvedValue({
      id: 'waffle-001',
      sender_name: 'Ryan',
      recipient_name: 'Priya',
      flavor: 'Classic Buttermilk',
      message: 'For untangling the debugger mystery before coffee.',
      created_at: '2026-03-31T15:00:00.000Z',
      celebration_count: 3,
    })

    const { response, state } = createResponse()

    await celebrateHandler(
      {
        method: 'POST',
        body: { browserToken: 'browser-123' },
        query: { id: 'waffle-001' },
      } as never,
      response as never
    )

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (waffle_id, browser_token) DO NOTHING'),
      ['waffle-001', 'browser-123']
    )
    expect(state.statusCode).toBe(200)
    expect(state.body).toEqual({
      waffle: expect.objectContaining({
        id: 'waffle-001',
        celebrationCount: 3,
      }),
    })
  })
})
