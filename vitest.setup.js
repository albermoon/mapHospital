import '@testing-library/jest-dom'

// Polyfills/mocks that tests may need
window.scrollTo = window.scrollTo || (() => {})

// Mock Leaflet CSS injection issues if any component imports it in tests
// No-op for leaflet CSS since Vitest with jsdom doesn't load CSS

