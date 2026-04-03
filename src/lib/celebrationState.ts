import { type Waffle } from '../domain/waffles'

const CELEBRATED_WAFFLE_IDS_KEY = 'vvaffle:celebrated-waffle-ids'
const BROWSER_TOKEN_KEY = 'vvaffle:browser-token'

let memoryCelebratedWaffleIds = new Set<string>()
let memoryBrowserToken: string | null = null

const getStorage = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const parseCelebratedIds = (value: string | null) => {
  if (!value) {
    return new Set<string>()
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return new Set<string>()
    }

    return new Set(
      parsed.filter((item): item is string => typeof item === 'string')
    )
  } catch {
    return new Set<string>()
  }
}

const createBrowserToken = () =>
  globalThis.crypto?.randomUUID?.() ??
  `browser-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const getCelebratedWaffleIds = () => {
  const storage = getStorage()

  if (!storage) {
    return new Set(memoryCelebratedWaffleIds)
  }

  return parseCelebratedIds(storage.getItem(CELEBRATED_WAFFLE_IDS_KEY))
}

export const markWaffleCelebrated = (waffleId: string) => {
  const nextCelebratedIds = getCelebratedWaffleIds()
  nextCelebratedIds.add(waffleId)
  memoryCelebratedWaffleIds = nextCelebratedIds

  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.setItem(
    CELEBRATED_WAFFLE_IDS_KEY,
    JSON.stringify([...nextCelebratedIds])
  )
}

export const syncViewerCelebrations = (waffles: Waffle[]) => {
  const celebratedIds = getCelebratedWaffleIds()

  return waffles.map((waffle) => ({
    ...waffle,
    viewerHasCelebrated: celebratedIds.has(waffle.id),
  }))
}

export const getBrowserToken = () => {
  const storage = getStorage()

  if (!storage) {
    if (!memoryBrowserToken) {
      memoryBrowserToken = createBrowserToken()
    }

    return memoryBrowserToken
  }

  const existingToken = storage.getItem(BROWSER_TOKEN_KEY)
  if (existingToken) {
    memoryBrowserToken = existingToken
    return existingToken
  }

  const nextToken = memoryBrowserToken ?? createBrowserToken()
  memoryBrowserToken = nextToken
  storage.setItem(BROWSER_TOKEN_KEY, nextToken)
  return nextToken
}
