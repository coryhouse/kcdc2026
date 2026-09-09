import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <section>
      <h1 className="font-display text-4xl font-medium tracking-tight">About</h1>
      <p className="mt-3 text-muted">
        A second route, here to prove that navigation works.
      </p>
    </section>
  )
}
