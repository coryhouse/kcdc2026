import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { foods } from '../food'
import { routeTree } from '../routeTree.gen'

function cardNames() {
  return screen
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)
}

async function renderMenu() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/menu'] }),
  })
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: 'Menu', level: 1 })
}

describe('menu page', () => {
  it('lists every food', async () => {
    await renderMenu()

    const items = screen.getAllByRole('listitem')
    // Each card also renders a list of tags, so filter to the cards themselves.
    const cards = screen.getAllByRole('heading', { level: 2 })
    expect(cards).toHaveLength(foods.length)
    expect(items.length).toBeGreaterThanOrEqual(foods.length)

    for (const food of foods) {
      expect(
        screen.getByRole('heading', { name: food.name, level: 2 }),
      ).toBeInTheDocument()
    }
  })

  it('shows each food price formatted as currency', async () => {
    await renderMenu()

    // Prices are not unique across the menu, so scope to a single card.
    const burger = screen
      .getByRole('heading', { name: 'Burger', level: 2 })
      .closest('article')
    expect(within(burger!).getByText('$8.99')).toBeInTheDocument()

    const lamb = screen
      .getByRole('heading', { name: 'Lamb Chop', level: 2 })
      .closest('article')
    expect(within(lamb!).getByText('$19.99')).toBeInTheDocument()
  })

  it('renders each image from the public images directory with alt text', async () => {
    await renderMenu()

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(foods.length)

    const burger = screen.getByAltText('Burger')
    expect(burger).toHaveAttribute('src', '/images/burger.jpg')
  })

  it('renders the tags for a food', async () => {
    await renderMenu()

    const cajun = screen
      .getByRole('heading', { name: 'Cajun Pasta', level: 2 })
      .closest('article')
    expect(cajun).not.toBeNull()
    for (const tag of ['Lunch', 'Dinner', 'Spicy']) {
      expect(within(cajun!).getByText(tag)).toBeInTheDocument()
    }
  })

  describe('search and filters', () => {
    it('filters by name', async () => {
      await renderMenu()

      await userEvent.type(screen.getByLabelText('Search'), 'burger')

      expect(cardNames()).toEqual(['Burger'])
    })

    it('filters by words in the description', async () => {
      await renderMenu()

      await userEvent.type(screen.getByLabelText('Search'), 'creole')

      expect(cardNames()).toEqual(['Cajun Pasta'])
    })

    it('requires every selected tag', async () => {
      await renderMenu()

      await userEvent.click(screen.getByRole('checkbox', { name: 'Lunch' }))
      const lunch = cardNames()
      expect(lunch).toContain('Pesto Bowtie Pasta')

      await userEvent.click(screen.getByRole('checkbox', { name: 'Spicy' }))
      const lunchAndSpicy = cardNames()
      expect(lunchAndSpicy.length).toBeLessThan(lunch.length)
      for (const name of lunchAndSpicy) {
        const food = foods.find((f) => f.name === name)!
        expect(food.tags).toEqual(expect.arrayContaining(['Lunch', 'Spicy']))
      }
    })

    it('filters by max price', async () => {
      await renderMenu()

      const slider = screen.getByLabelText(/max price/i)
      fireEvent.change(slider, { target: { value: '8' } })

      const names = cardNames()
      expect(names.length).toBeGreaterThan(0)
      for (const name of names) {
        expect(foods.find((f) => f.name === name)!.price).toBeLessThanOrEqual(8)
      }
      expect(names).not.toContain('Lamb Chop')
    })

    it('reports the result count and clears the filters', async () => {
      await renderMenu()

      await userEvent.type(screen.getByLabelText('Search'), 'burger')
      expect(screen.getByText('1 item')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

      expect(cardNames()).toHaveLength(foods.length)
      expect(screen.getByLabelText('Search')).toHaveValue('')
    })

    it('explains when nothing matches', async () => {
      await renderMenu()

      await userEvent.type(screen.getByLabelText('Search'), 'zzzz')

      expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0)
      expect(screen.getByText(/nothing on the menu matches/i)).toBeInTheDocument()
    })
  })
})
