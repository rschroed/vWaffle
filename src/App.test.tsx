import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { SEEDED_WAFFLES, WAFFLE_FLAVORS } from './domain/waffles'
import { createMockWaffleRepository } from './lib/waffleRepository'

describe('App', () => {
  it('renders the seeded waffles on first load', async () => {
    render(<App repository={createMockWaffleRepository()} />)

    expect(await screen.findByText(/Ryan sent a waffle to Priya/i)).toBeInTheDocument()
    expect(
      screen.getByText(SEEDED_WAFFLES[1].message)
    ).toBeInTheDocument()
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
})
