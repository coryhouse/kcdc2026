import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { routeTree } from '../routeTree.gen'

function renderApp(initialPath: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })
  render(<RouterProvider router={router} />)
  return router
}

describe('routing', () => {
  it('renders the home route', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: 'kcdc2026' }),
    ).toBeInTheDocument()
  })

  it('renders the about route directly', async () => {
    renderApp('/about')
    expect(
      await screen.findByRole('heading', { name: 'About' }),
    ).toBeInTheDocument()
  })

  it('navigates from home to about', async () => {
    const router = renderApp('/')
    await screen.findByRole('heading', { name: 'kcdc2026' })

    await userEvent.click(screen.getByRole('link', { name: 'About' }))

    expect(
      await screen.findByRole('heading', { name: 'About' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/about')
  })
})
