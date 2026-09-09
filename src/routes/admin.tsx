import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { NewFoodForm } from '../components/NewFoodForm'
import type { Food } from '../food'

export const Route = createFileRoute('/admin')({
  component: Admin,
})

function Admin() {
  const [lastAdded, setLastAdded] = useState<Food | null>(null)

  return (
    <section>
      <header className="max-w-xl">
        <h1 className="font-display text-5xl leading-none font-medium tracking-tight text-strong sm:text-6xl">
          Add an item
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          New dishes go straight onto the menu. They live in this browser only —
          there is no kitchen server to save them to yet.
        </p>
      </header>

      {/* Kept mounted so the confirmation is announced when it appears rather
          than when the region is added to the page. */}
      <div role="status" className="mt-8 min-h-6 text-[0.9375rem]">
        {lastAdded && (
          <p className="text-muted">
            Added <span className="text-strong">{lastAdded.name}</span>.{' '}
            <Link
              to="/menu"
              className="text-strong underline underline-offset-4"
            >
              See it on the menu
            </Link>
          </p>
        )}
      </div>

      <NewFoodForm onAdded={setLastAdded} />
    </section>
  )
}
