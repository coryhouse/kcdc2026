import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-3xl gap-6 px-6 py-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900 [&.active]:font-bold [&.active]:text-slate-900">
            Home
          </Link>
          <Link to="/about" className="text-slate-600 hover:text-slate-900 [&.active]:font-bold [&.active]:text-slate-900">
            About
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}
