import { describe, expect, it, vi } from 'vitest'
import {
  createApiWaffleRepository,
  createMockWaffleRepository,
} from '../waffleRepository'
import { SEEDED_WAFFLES, WAFFLE_FLAVORS } from '../../domain/waffles'

describe('createMockWaffleRepository', () => {
  it('keeps seeded waffles sorted newest first', async () => {
    const repository = createMockWaffleRepository()
    const waffles = await repository.listWaffles()

    expect(waffles).toHaveLength(SEEDED_WAFFLES.length)
    expect(waffles[0].createdAt >= waffles[1].createdAt).toBe(true)
  })
})

describe('createApiWaffleRepository', () => {
  it('maps list responses into waffles', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          waffles: [SEEDED_WAFFLES[0]],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    const repository = createApiWaffleRepository({
      baseUrl: 'https://example.com',
      fetchImpl,
    })

    const waffles = await repository.listWaffles()

    expect(fetchImpl).toHaveBeenCalledWith('https://example.com/api/waffles')
    expect(waffles).toEqual([SEEDED_WAFFLES[0]])
  })

  it('posts send requests and returns the created waffle', async () => {
    const createdAt = '2026-04-01T00:00:00.000Z'
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          waffle: {
            id: 'waffle-live-1',
            sender: { name: 'Avery' },
            recipient: { name: 'Sam' },
            flavor: WAFFLE_FLAVORS[0],
            message: 'Thanks for helping unblock the launch.',
            createdAt,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    const repository = createApiWaffleRepository({
      baseUrl: 'https://example.com',
      fetchImpl,
    })

    const waffle = await repository.sendWaffle({
      senderName: 'Avery',
      recipientName: 'Sam',
      flavor: WAFFLE_FLAVORS[0],
      message: 'Thanks for helping unblock the launch.',
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.com/api/waffles',
      expect.objectContaining({
        method: 'POST',
      })
    )
    expect(waffle.createdAt).toBe(createdAt)
    expect(waffle.sender.name).toBe('Avery')
  })
})
