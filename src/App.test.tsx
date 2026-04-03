import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { SEEDED_WAFFLES, WAFFLE_FLAVORS } from './domain/waffles'
import { getWaffleFlavorArtwork } from './features/home/waffleFlavorArtwork'
import {
  createMockWaffleRepository,
  type WaffleRepository,
} from './lib/waffleRepository'

const mockMatchMedia = (
  matches:
    | boolean
    | Record<string, boolean>
    | ((query: string) => boolean)
) => {
  const resolveMatches = (query: string) => {
    if (typeof matches === 'boolean') {
      return matches
    }

    if (typeof matches === 'function') {
      return matches(query)
    }

    return matches[query] ?? false
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: resolveMatches(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

const createRejectingRepository = (
  overrides: Partial<WaffleRepository>
): WaffleRepository => ({
  ...createMockWaffleRepository(),
  ...overrides,
})

describe('App', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the seeded waffles on first load', async () => {
    render(<App repository={createMockWaffleRepository()} />)

    const cardTitle = await screen.findByText(/Ryan sent a waffle to Priya/i)

    expect(cardTitle).toBeInTheDocument()
    expect(
      screen.getByText(SEEDED_WAFFLES[1].message)
    ).toBeInTheDocument()
    expect(screen.getByText('2 cheers')).toBeInTheDocument()

    const card = cardTitle.closest('article')

    expect(card).not.toBeNull()
    expect(
      within(card as HTMLElement).getByRole('img', {
        name: /Classic Buttermilk waffle artwork/i,
      })
    ).toHaveAttribute(
      'src',
      getWaffleFlavorArtwork('Classic Buttermilk').src
    )
    expect(card).toHaveAttribute('data-arcade-arrival', 'idle')
  })

  it('lets the viewer celebrate a waffle once', async () => {
    const user = userEvent.setup()

    render(<App repository={createMockWaffleRepository()} />)

    const cardTitle = await screen.findByText(/Alex sent a waffle to Taylor/i)
    const card = cardTitle.closest('article')

    expect(card).not.toBeNull()

    await user.click(within(card as HTMLElement).getByRole('button', { name: /Celebrate/i }))

    expect(within(card as HTMLElement).getByRole('button', { name: /Celebrated/i })).toBeDisabled()
    expect(within(card as HTMLElement).getByText('1 cheer')).toBeInTheDocument()
    expect(card).toHaveAttribute('data-arcade-celebration', 'active')
    expect(
      within(card as HTMLElement).getByText('1 cheer').closest('[data-arcade-count]')
    ).toHaveAttribute('data-arcade-count', 'active')
  })

  it('renders previously celebrated waffles as completed for this browser', async () => {
    window.localStorage.setItem(
      'vvaffle:celebrated-waffle-ids',
      JSON.stringify(['waffle-001'])
    )

    render(<App repository={createMockWaffleRepository()} />)

    const cardTitle = await screen.findByText(/Ryan sent a waffle to Priya/i)
    const card = cardTitle.closest('article')

    expect(card).not.toBeNull()
    expect(
      within(card as HTMLElement).getByRole('button', { name: /Celebrated/i })
    ).toBeDisabled()
    expect(card).toHaveAttribute('data-arcade-celebration', 'idle')
  })

  it('lets the user send a new waffle into the feed and marks the new top card as arriving', async () => {
    const user = userEvent.setup()

    render(<App repository={createMockWaffleRepository()} />)

    await user.type(
      await screen.findByLabelText(/From/i),
      'Casey'
    )
    await user.type(screen.getByLabelText(/To/i), 'Sam')
    await user.selectOptions(
      screen.getByLabelText(/Flavor/i),
      'Put an Egg On It'
    )
    await user.type(
      screen.getByLabelText(/Why this waffle\?/i),
      'For making the Vercel preview look effortless.'
    )
    await user.click(screen.getByRole('button', { name: /Send waffle/i }))

    const cardTitle = await screen.findByText(/Casey sent a waffle to Sam/i)

    expect(cardTitle).toBeInTheDocument()

    const card = cardTitle.closest('article')

    expect(card).not.toBeNull()
    expect(card).toHaveAttribute('data-arcade-arrival', 'active')
    expect(
      within(card as HTMLElement).getByRole('img', {
        name: /Put an Egg On It waffle artwork/i,
      })
    ).toHaveAttribute(
      'src',
      getWaffleFlavorArtwork('Put an Egg On It').src
    )
    expect(
      within(card as HTMLElement).getByText(
        /For making the Vercel preview look effortless\./i
      )
    ).toBeInTheDocument()
  })

  it('does not leave arcade markers behind when send or celebrate fails', async () => {
    const user = userEvent.setup()
    const sendError = new Error('Unable to send right now.')
    const celebrateError = new Error('Unable to celebrate right now.')

    render(
      <App
        repository={createRejectingRepository({
          celebrateWaffle: async () => {
            throw celebrateError
          },
          sendWaffle: async () => {
            throw sendError
          },
        })}
      />
    )

    await screen.findByText(/Ryan sent a waffle to Priya/i)

    await user.type(await screen.findByLabelText(/From/i), 'Morgan')
    await user.type(screen.getByLabelText(/To/i), 'Jules')
    await user.type(
      screen.getByLabelText(/Why this waffle\?/i),
      'For making the deploy train look effortless.'
    )
    await user.click(screen.getByRole('button', { name: /Send waffle/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to send right now\./i)
    expect(document.querySelector('[data-arcade-arrival="active"]')).toBeNull()

    const cardTitle = screen.getByText(/Alex sent a waffle to Taylor/i)
    const card = cardTitle.closest('article')

    expect(card).not.toBeNull()

    await user.click(within(card as HTMLElement).getByRole('button', { name: /Celebrate/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to celebrate right now\./i)
    expect(card).toHaveAttribute('data-arcade-celebration', 'idle')
    expect(
      within(card as HTMLElement).getByText('0 cheers').closest('[data-arcade-count]')
    ).toHaveAttribute('data-arcade-count', 'idle')
  })

  it('opens the mobile composer sheet and closes it after sending', async () => {
    const user = userEvent.setup()

    mockMatchMedia({
      '(max-width: 640px)': true,
      '(prefers-reduced-motion: reduce)': false,
    })

    render(<App repository={createMockWaffleRepository()} />)

    expect(screen.queryByRole('dialog', { name: /Send a waffle/i })).not.toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', { name: /^Send a waffle$/i })
    )

    expect(
      await screen.findByRole('dialog', { name: /Send a waffle/i })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/From/i), 'Taylor')
    await user.type(screen.getByLabelText(/To/i), 'Jordan')
    await user.selectOptions(
      screen.getByLabelText(/Flavor/i),
      WAFFLE_FLAVORS[0]
    )
    await user.type(
      screen.getByLabelText(/Why this waffle\?/i),
      'For making the mobile composer feel smooth.'
    )
    await user.click(screen.getByRole('button', { name: /Send waffle/i }))

    expect(await screen.findByText(/Taylor sent a waffle to Jordan/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /Send a waffle/i })
      ).not.toBeInTheDocument()
    })
  })

  it('keeps reduced-motion updates visible without arcade travel or burst effects', async () => {
    const user = userEvent.setup()

    mockMatchMedia((query) => query === '(prefers-reduced-motion: reduce)')

    render(<App repository={createMockWaffleRepository()} />)

    await user.type(await screen.findByLabelText(/From/i), 'Robin')
    await user.type(screen.getByLabelText(/To/i), 'Avery')
    await user.type(
      screen.getByLabelText(/Why this waffle\?/i),
      'For shipping a calmer motion mode.'
    )
    await user.click(screen.getByRole('button', { name: /Send waffle/i }))

    const cardTitle = await screen.findByText(/Robin sent a waffle to Avery/i)
    const sentCard = cardTitle.closest('article')

    expect(sentCard).not.toBeNull()

    const existingCardTitle = screen.getByText(/Alex sent a waffle to Taylor/i)
    const existingCard = existingCardTitle.closest('article')

    expect(existingCard).not.toBeNull()

    await user.click(
      within(existingCard as HTMLElement).getByRole('button', { name: /Celebrate/i })
    )

    expect(within(existingCard as HTMLElement).getByText('1 cheer')).toBeInTheDocument()
    expect(document.querySelector('[data-arcade-burst="active"]')).toBeNull()
  })
})
