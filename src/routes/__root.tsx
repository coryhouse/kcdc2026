import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeToggle } from '../components/ThemeToggle'

export const Route = createRootRoute({
  component: RootLayout,
})

const navLinkClass =
  'text-muted transition-colors hover:text-strong [&.active]:font-medium [&.active]:text-strong'

function RootLayout() {
  return (
    <div className="min-h-screen bg-ground text-strong">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
          <nav className="flex gap-6 text-sm">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/menu" className={navLinkClass}>
              Menu
            </Link>
            <Link to="/about" className={navLinkClass}>
              About
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}
