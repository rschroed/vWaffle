import { SEEDED_WAFFLES, type SendWaffleInput, type Waffle } from '../domain/waffles'

export interface WaffleRepository {
  listWaffles(): Promise<Waffle[]>
  sendWaffle(input: SendWaffleInput): Promise<Waffle>
  seedDemoData?(): Promise<void>
}

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `waffle-${Date.now().toString(36)}`

export const createMockWaffleRepository = (
  initialWaffles: Waffle[] = SEEDED_WAFFLES
): WaffleRepository => {
  let waffles = [...initialWaffles]

  return {
    async listWaffles() {
      return [...waffles].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt)
      )
    },
    async sendWaffle(input) {
      const nextWaffle: Waffle = {
        id: createId(),
        sender: { name: input.senderName.trim() },
        recipient: { name: input.recipientName.trim() },
        flavor: input.flavor,
        message: input.message.trim(),
        createdAt: new Date().toISOString(),
      }

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
