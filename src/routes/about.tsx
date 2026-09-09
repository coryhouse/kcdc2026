import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="mt-3 text-slate-600">
        A second route, here to prove that navigation works.
      </p>
    </section>
  )
}
