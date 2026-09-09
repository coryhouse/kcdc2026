import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { FoodCard } from '../components/FoodCard'
import { MenuFilters, type MenuFiltersValue } from '../components/MenuFilters'
import { foods } from '../food'

export const Route = createFileRoute('/menu')({
  component: Menu,
})

/* Whole dollars keep the slider's labels and steps readable. */
const priceRange = {
  min: Math.floor(Math.min(...foods.map((food) => food.price))),
  max: Math.ceil(Math.max(...foods.map((food) => food.price))),
}

function Menu() {
  const [filters, setFilters] = useState<MenuFiltersValue>({
    query: '',
    tags: [],
    maxPrice: priceRange.max,
  })

  const results = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return foods.filter((food) => {
      const matchesQuery =
        query === '' ||
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
      // Tags narrow rather than widen: a dish must carry every selected tag.
      const matchesTags = filters.tags.every((tag) => food.tags.includes(tag))
      return matchesQuery && matchesTags && food.price <= filters.maxPrice
    })
  }, [filters])

  return (
    <section>
      <header className="max-w-xl">
        <h1 className="font-display text-5xl leading-none font-medium tracking-tight text-strong sm:text-6xl">
          Menu
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Everything we serve, from breakfast through last call.
        </p>
      </header>

      <MenuFilters
        value={filters}
        onChange={setFilters}
        priceRange={priceRange}
        resultCount={results.length}
      />

      {results.length === 0 ? (
        <p className="mt-12 text-base leading-relaxed text-muted">
          Nothing on the menu matches that. Try a broader search or a higher
          price.
        </p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((food, i) => (
            <li key={food.id}>
              <FoodCard food={food} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
