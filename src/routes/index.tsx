import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section>
      <h1 className="font-display text-4xl font-medium tracking-tight">kcdc2026</h1>
      <p className="mt-3 text-muted">
        React 19 + Vite + TypeScript, with Tailwind CSS and TanStack Router.
      </p>
    </section>
  )
}
