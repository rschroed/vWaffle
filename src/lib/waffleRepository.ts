import { SEEDED_WAFFLES, type SendWaffleInput, type Waffle } from '../domain/waffles'
import { getBrowserToken } from './celebrationState'

export interface WaffleRepository {
  listWaffles(): Promise<Waffle[]>
  sendWaffle(input: SendWaffleInput): Promise<Waffle>
  celebrateWaffle(waffleId: string): Promise<Waffle>
  seedDemoData?(): Promise<void>
}

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `waffle-${Date.now().toString(36)}`

const normalizeWaffle = (waffle: Waffle): Waffle => ({
  ...waffle,
  sender: { name: waffle.sender.name.trim() },
  recipient: { name: waffle.recipient.name.trim() },
  message: waffle.message.trim(),
  celebrationCount: Math.max(0, waffle.celebrationCount ?? 0),
})

const toDomainWaffle = (input: SendWaffleInput): Waffle => ({
  id: createId(),
  sender: { name: input.senderName.trim() },
  recipient: { name: input.recipientName.trim() },
  flavor: input.flavor,
  message: input.message.trim(),
  createdAt: new Date().toISOString(),
  celebrationCount: 0,
})

export const createMockWaffleRepository = (
  initialWaffles: Waffle[] = SEEDED_WAFFLES
): WaffleRepository => {
  let waffles = initialWaffles.map(normalizeWaffle)

  return {
    async listWaffles() {
      return [...waffles].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt)
      )
    },
    async sendWaffle(input) {
      const nextWaffle = toDomainWaffle(input)

      waffles = [nextWaffle, ...waffles]
      return nextWaffle
    },
    async celebrateWaffle(waffleId) {
      let updatedWaffle: Waffle | null = null

      waffles = waffles.map((waffle) => {
        if (waffle.id !== waffleId) {
          return waffle
        }

        updatedWaffle = {
          ...waffle,
          celebrationCount: waffle.celebrationCount + 1,
        }

        return updatedWaffle
      })

      if (!updatedWaffle) {
        throw new Error('Unable to find that waffle right now.')
      }

      return updatedWaffle
    },
    async seedDemoData() {
      if (waffles.length === 0) {
        waffles = [...SEEDED_WAFFLES]
      }
    },
  }
}

type ApiRepositoryOptions = {
  baseUrl?: string
  fetchImpl?: typeof fetch
  getBrowserToken?: () => string | null
}

const resolveApiUrl = (path: string, baseUrl?: string) =>
  baseUrl ? new URL(path, baseUrl).toString() : path

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export const createApiWaffleRepository = ({
  baseUrl,
  fetchImpl = fetch,
  getBrowserToken: getBrowserTokenImpl = getBrowserToken,
}: ApiRepositoryOptions = {}): WaffleRepository => {
  return {
    async listWaffles() {
      const response = await fetchImpl(resolveApiUrl('/api/waffles', baseUrl))

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response))
      }

      const payload = (await response.json()) as { waffles: Waffle[] }
      return payload.waffles.map(normalizeWaffle)
    },
    async sendWaffle(input) {
      const response = await fetchImpl(resolveApiUrl('/api/waffles', baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response))
      }

      const payload = (await response.json()) as { waffle: Waffle }
      return normalizeWaffle(payload.waffle)
    },
    async celebrateWaffle(waffleId) {
      const browserToken = getBrowserTokenImpl()
      const response = await fetchImpl(
        resolveApiUrl(`/api/waffles/${encodeURIComponent(waffleId)}/celebrate`, baseUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ browserToken }),
        }
      )

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response))
      }

      const payload = (await response.json()) as { waffle: Waffle }
      return normalizeWaffle(payload.waffle)
    },
  }
}

export const createDefaultWaffleRepository = (): WaffleRepository => {
  const mode = import.meta.env.VITE_WAFFLE_REPOSITORY
  const apiBaseUrl = import.meta.env.VITE_WAFFLE_API_BASE_URL || undefined

  if (mode === 'mock') {
    return createMockWaffleRepository()
  }

  if (mode === 'api') {
    return createApiWaffleRepository({ baseUrl: apiBaseUrl })
  }

  if (import.meta.env.DEV) {
    return createMockWaffleRepository()
  }

  return createApiWaffleRepository({ baseUrl: apiBaseUrl })
}
