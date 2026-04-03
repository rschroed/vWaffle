import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { SEEDED_WAFFLES, WAFFLE_FLAVORS } from './domain/waffles'
import { createMockWaffleRepository } from './lib/waffleRepository'

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 640px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('App', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the seeded waffles on first load', async () => {
    render(<App repository={createMockWaffleRepository()} />)

    expect(await screen.findByText(/Ryan sent a waffle to Priya/i)).toBeInTheDocument()
    expect(
      screen.getByText(SEEDED_WAFFLES[1].message)
    ).toBeInTheDocument()
    expect(screen.getByText('2 cheers')).toBeInTheDocument()
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
  })

  it('lets the user send a new waffle into the feed', async () => {
    const user = userEvent.setup()

    render(<App repository={createMockWaffleRepository()} />)

    await user.type(
      await screen.findByLabelText(/From/i),
      'Casey'
    )
    await user.type(screen.getByLabelText(/To/i), 'Sam')
    await user.selectOptions(
      screen.getByLabelText(/Flavor/i),
      WAFFLE_FLAVORS[2]
    )
    await user.type(
      screen.getByLabelText(/Why this waffle\?/i),
      'For making the Vercel preview look effortless.'
    )
    await user.click(screen.getByRole('button', { name: /Send waffle/i }))

    expect(await screen.findByText(/Casey sent a waffle to Sam/i)).toBeInTheDocument()
    expect(
      screen.getByText(/For making the Vercel preview look effortless\./i)
    ).toBeInTheDocument()
  })

  it('opens the mobile composer sheet and closes it after sending', async () => {
    const user = userEvent.setup()

    mockMatchMedia(true)

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
})
