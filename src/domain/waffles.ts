export const WAFFLE_FLAVORS = [
  'Classic Buttermilk',
  'Blueberry Blitz',
  'Chocolate Confetti',
  'Matcha Mingle',
  'Savory Cheddar',
] as const

export type WaffleFlavor = (typeof WAFFLE_FLAVORS)[number]

export type Sender = {
  name: string
}

export type Recipient = {
  name: string
}

export type CreatedAt = string

export type Waffle = {
  id: string
  sender: Sender
  recipient: Recipient
  flavor: WaffleFlavor
  message: string
  createdAt: CreatedAt
}

export type SendWaffleInput = {
  senderName: string
  recipientName: string
  flavor: WaffleFlavor
  message: string
}

export const SEEDED_WAFFLES: Waffle[] = [
  {
    id: 'waffle-001',
    sender: { name: 'Ryan' },
    recipient: { name: 'Priya' },
    flavor: 'Classic Buttermilk',
    message: 'For untangling the debugger mystery before coffee.',
    createdAt: '2026-03-31T15:00:00.000Z',
  },
  {
    id: 'waffle-002',
    sender: { name: 'Mina' },
    recipient: { name: 'Jordan' },
    flavor: 'Chocolate Confetti',
    message: 'You turned the prototype review into a tiny party.',
    createdAt: '2026-03-31T14:15:00.000Z',
  },
  {
    id: 'waffle-003',
    sender: { name: 'Alex' },
    recipient: { name: 'Taylor' },
    flavor: 'Blueberry Blitz',
    message: 'For the Figma cleanup pass that made the round-trip sing.',
    createdAt: '2026-03-31T13:20:00.000Z',
  },
]
