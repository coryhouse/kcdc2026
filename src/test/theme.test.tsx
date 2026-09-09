import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { routeTree } from '../routeTree.gen'

function renderApp() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
}

const root = () => document.documentElement

describe('theme switch', () => {
  it('starts light and offers to switch to dark', async () => {
    renderApp()

    expect(root()).not.toHaveClass('dark')
    expect(
      await screen.findByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument()
  })

  it('switches to dark and back', async () => {
    renderApp()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Switch to dark theme' }),
    )
    expect(root()).toHaveClass('dark')

    // The control now offers the opposite action.
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    )
    expect(root()).not.toHaveClass('dark')
  })

  it('remembers the choice', async () => {
    renderApp()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Switch to dark theme' }),
    )
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('picks up a theme the pre-paint script already resolved', async () => {
    // index.html sets this class before React mounts.
    document.documentElement.classList.add('dark')
    renderApp()

    expect(
      await screen.findByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })
})
