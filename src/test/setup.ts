import '@testing-library/jest-dom/vitest'

// jsdom does not implement scrollTo; the router's scrollRestoration calls it.
window.scrollTo = () => {}
