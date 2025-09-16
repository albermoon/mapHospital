import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGoogleSheets, SHEET_NAMES } from '../hooks/useGoogleSheets'

describe('useGoogleSheets', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchData performs GET and sets data on success', async () => {
    const mockPayload = { status: 'success', data: [{ id: '1', name: 'A' }] }
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPayload) })

    const { result } = renderHook(() => useGoogleSheets())

    await act(async () => {
      await result.current.fetchData(SHEET_NAMES.HOSPITALES)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/google-sheets?sheet=Hospitales', { method: 'GET' })
    expect(result.current.data).toEqual(mockPayload.data)
    expect(result.current.connected).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('saveData performs POST and returns success json', async () => {
    const mockResponse = { status: 'success', id: '123' }
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) })

    const { result } = renderHook(() => useGoogleSheets())

    const organization = { name: 'New Org' }
    let res
    await act(async () => {
      res = await result.current.saveData(organization)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/google-sheets', {
      method: 'POST',
      body: JSON.stringify(organization),
      headers: { 'Content-Type': 'application/json' }
    })
    expect(res).toEqual(mockResponse)
  })
})


