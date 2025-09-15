import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchControl from '../components/SearchControl'
import { I18nProvider } from '../utils/i18n'

const organizations = [
  { id: '1', name: 'City Hospital', address: '123 Main St', city: 'Brussels', country: 'Belgium', specialty: 'Cardiology', type: 'hospital' },
  { id: '2', name: 'Health Assoc', address: '456 Oak Ave', city: 'Paris', country: 'France', specialty: 'Wellness', type: 'association' },
  { id: '3', name: 'General Hospital', address: '789 Pine Rd', city: 'Madrid', country: 'Spain', type: 'hospital' },
]

describe('SearchControl', () => {
  it('filters and shows search results, and calls onSelectOrganization', () => {
    const onSelect = vi.fn()

    render(
      <I18nProvider>
        <SearchControl organizations={organizations} onSelectOrganization={onSelect} />
      </I18nProvider>
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'City' } })

    const resultRow = screen.getByText('City Hospital').closest('.search-result')
    expect(resultRow).toBeTruthy()
    fireEvent.click(resultRow)

    expect(onSelect).toHaveBeenCalled()
  })
})


