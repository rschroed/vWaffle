import { SEEDED_WAFFLES, type SendWaffleInput, type Waffle } from '../domain/waffles'

export interface WaffleRepository {
  listWaffles(): Promise<Waffle[]>
  sendWaffle(input: SendWaffleInput): Promise<Waffle>
  seedDemoData?(): Promise<void>
}

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `waffle-${Date.now().toString(36)}`

const normalizeWaffle = (waffle: Waffle): Waffle => ({
  ...waffle,
  sender: { name: waffle.sender.name.trim() },
  recipient: { name: waffle.recipient.name.trim() },
  message: waffle.message.trim(),
})

const toDomainWaffle = (input: SendWaffleInput): Waffle => ({
  id: createId(),
  sender: { name: input.senderName.trim() },
  recipient: { name: input.recipientName.trim() },
  flavor: input.flavor,
  message: input.message.trim(),
  createdAt: new Date().toISOString(),
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
