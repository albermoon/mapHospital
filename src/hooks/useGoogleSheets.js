import { useState, useCallback } from 'react'

export const SHEET_NAMES = {
  ORGANIZACIONES: 'Organizaciones',
  HOSPITALES: 'Hospitales',
  ASOCIACIONES: 'Asociaciones'
}

export function useGoogleSheets() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  const fetchData = useCallback(async (sheetName) => {
    setLoading(true)
    setError(null)

    const downloadStartTime = performance.now()
    console.log(`🚀 Starting data download for sheet: ${sheetName}`)

    try {
      const res = await fetch(
        `/api/google-sheets?sheet=${sheetName}`,
        { method: 'GET' }
      )

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const json = await res.json()
      console.log('API Response:', json)

      if (json.status === 'success') {
        const responseData = json.data || []
        setData(responseData)
        setConnected(true)
        const downloadEndTime = performance.now()
        console.log(`⏱️ Data download completed in ${(downloadEndTime - downloadStartTime).toFixed(2)}ms`)
        console.log(`📊 Downloaded ${responseData.length} organizations`)

        return responseData
      } else {
        throw new Error(json.message || 'Unknown error from API')
      }
    } catch (err) {
      console.error('❌ Fetch failed:', err)
      setError(err.message)
      setData([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const saveData = useCallback(async (organization) => {
    try {
      const res = await fetch('/api/google-sheets', {
        method: 'POST',
        body: JSON.stringify(organization),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const json = await res.json()
      console.log('Save response:', json)

      if (json.status !== 'success') {
        throw new Error(json.message || 'Save failed')
      }

      return json
    } catch (err) {
      console.error('❌ Save failed:', err)
      throw err
    }
  }, [])

  return {
    data,
    loading,
    error,
    connected,
    fetchData,
    saveData
  }
}
