import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

// jsdom does not implement scrollTo; the router's scrollRestoration calls it.
window.scrollTo = () => {}

/**
 * jsdom does not implement matchMedia. Default to a light system preference;
 * a test can override the return value to simulate a dark-mode reader.
 */
export const matchMediaMock = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: matchMediaMock,
})

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})
