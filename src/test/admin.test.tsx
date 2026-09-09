import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { foods } from '../food'
import { routeTree } from '../routeTree.gen'

async function renderAdmin() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/admin'] }),
  })
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: 'Add an item', level: 1 })
  return router
}

type Draft = {
  name?: string
  image?: string
  price?: string
  description?: string
  tags?: Array<string>
}

const draft: Draft = {
  name: 'Fried Pickles',
  image: 'fried-pickles.jpg',
  price: '7.49',
  description: 'Hand-breaded dill spears with buttermilk ranch.',
  tags: ['Appetizer', 'Vegetarian'],
}

async function fillForm(values: Draft = draft) {
  if (values.name) await userEvent.type(screen.getByLabelText('Name'), values.name)
  if (values.image)
    await userEvent.type(screen.getByLabelText('Image'), values.image)
  if (values.price)
    await userEvent.type(screen.getByLabelText('Price'), values.price)
  if (values.description)
    await userEvent.type(
      screen.getByLabelText('Description'),
      values.description,
    )
  for (const tag of values.tags ?? []) {
    await userEvent.click(screen.getByRole('checkbox', { name: tag }))
  }
}

function submit() {
  return userEvent.click(screen.getByRole('button', { name: 'Add to menu' }))
}

/** The preview card, which is the only article on the admin page. */
function preview() {
  return screen.getByRole('article')
}

describe('admin: add a food', () => {
  it('adds the item and confirms it', async () => {
    await renderAdmin()

    await fillForm()
    await submit()

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Added Fried Pickles.')
    expect(
      within(status).getByRole('link', { name: 'See it on the menu' }),
    ).toBeInTheDocument()
  })

  it('clears the form after adding, ready for the next item', async () => {
    await renderAdmin()

    await fillForm()
    await submit()

    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Price')).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: 'Appetizer' })).not.toBeChecked()
  })

  it('puts the item on the menu', async () => {
    const router = await renderAdmin()

    await fillForm()
    await submit()
    await userEvent.click(
      screen.getByRole('link', { name: 'See it on the menu' }),
    )

    await screen.findByRole('heading', { name: 'Menu', level: 1 })
    expect(router.state.location.pathname).toBe('/menu')

    const card = screen
      .getByRole('heading', { name: 'Fried Pickles', level: 2 })
      .closest('article')
    expect(card).not.toBeNull()
    expect(within(card!).getByText('$7.49')).toBeInTheDocument()
    expect(within(card!).getByText('Appetizer')).toBeInTheDocument()
    expect(within(card!).getByAltText('Fried Pickles')).toHaveAttribute(
      'src',
      '/images/fried-pickles.jpg',
    )
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(
      foods.length + 1,
    )
  })

  it('keeps the item after a reload', async () => {
    await renderAdmin()

    await fillForm()
    await submit()

    const stored: unknown = JSON.parse(localStorage.getItem('added-foods')!)
    expect(stored).toEqual([
      {
        id: foods.length + 1,
        name: 'Fried Pickles',
        image: 'fried-pickles.jpg',
        price: 7.49,
        description: 'Hand-breaded dill spears with buttermilk ranch.',
        tags: ['Appetizer', 'Vegetarian'],
      },
    ])
  })

  it('accepts an image URL as well as a file name', async () => {
    await renderAdmin()

    await fillForm({ ...draft, image: 'https://example.test/pickles.jpg' })

    // A URL is passed through untouched rather than resolved against /images.
    expect(within(preview()).getByRole('img')).toHaveAttribute(
      'src',
      'https://example.test/pickles.jpg',
    )

    await submit()
    expect(screen.getByRole('status')).toHaveTextContent('Added Fried Pickles.')
  })

  it('previews the item as it is typed', async () => {
    await renderAdmin()

    // Nothing typed yet, so the card stands in for the finished item.
    expect(within(preview()).getByText('Untitled item')).toBeInTheDocument()
    expect(within(preview()).queryByRole('img')).not.toBeInTheDocument()

    await fillForm()

    const card = preview()
    expect(within(card).getByText('Fried Pickles')).toBeInTheDocument()
    expect(within(card).getByText('$7.49')).toBeInTheDocument()
    expect(within(card).getByText('Vegetarian')).toBeInTheDocument()
    expect(within(card).getByAltText('Fried Pickles')).toHaveAttribute(
      'src',
      '/images/fried-pickles.jpg',
    )
  })

  describe('validation', () => {
    it('refuses an empty form and says what is missing', async () => {
      await renderAdmin()

      await submit()

      const messages = screen.getAllByRole('alert').map((el) => el.textContent)
      expect(messages).toEqual([
        'Enter a name.',
        'Enter an image file name or URL.',
        'Enter a price.',
        'Enter a description.',
        'Pick at least one tag.',
      ])
      expect(localStorage.getItem('added-foods')).toBe('[]')
    })

    it('moves focus to the first field that needs attention', async () => {
      await renderAdmin()

      await fillForm({ ...draft, price: undefined })
      await submit()

      expect(screen.getByLabelText('Price')).toHaveFocus()
      expect(screen.getByLabelText('Price')).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    it('clears a message once the field is being fixed', async () => {
      await renderAdmin()

      await submit()
      expect(screen.getByText('Enter a name.')).toBeInTheDocument()

      await userEvent.type(screen.getByLabelText('Name'), 'F')

      expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
    })

    it('rejects a name already on the menu, whatever the casing', async () => {
      await renderAdmin()

      await fillForm({ ...draft, name: 'bUrGeR' })
      await submit()

      expect(screen.getByRole('alert')).toHaveTextContent(
        /already on the menu/i,
      )
      expect(screen.queryByRole('status')).toBeEmptyDOMElement()
    })

    it.each([
      ['free', 'Enter a price like 9.99.'],
      ['0', 'Enter a price above $0.'],
      ['9.999', 'Use at most two decimal places.'],
      ['1000', 'Enter a price under $1,000.'],
    ])('rejects a price of %s', async (price, message) => {
      await renderAdmin()

      await fillForm({ ...draft, price })
      await submit()

      expect(screen.getByRole('alert')).toHaveTextContent(message)
    })

    it('trims the values it saves', async () => {
      await renderAdmin()

      await fillForm({ ...draft, name: '  Fried Pickles  ' })
      await submit()

      expect(screen.getByRole('status')).toHaveTextContent(
        'Added Fried Pickles.',
      )
    })
  })

  it('starts over when reset', async () => {
    await renderAdmin()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(within(preview()).getByText('Untitled item')).toBeInTheDocument()
    expect(localStorage.getItem('added-foods')).toBe('[]')
  })
})
