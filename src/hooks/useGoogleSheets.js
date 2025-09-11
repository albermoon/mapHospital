import { useState, useCallback } from 'react'

// Sheet names as they exist in your Google Sheets
export const SHEET_NAMES = {
  ORGANIZACIONES: 'Organizaciones', // headers only
  HOSPITALES: 'Hospitales',
  ASOCIACIONES: 'Asociaciones'
}

export function useGoogleSheets() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  /**
   * Fetch data from Google Apps Script.
   * Always returns the full dataset from the selected sheet.
   */
  const fetchData = useCallback(async (sheetName) => {
    setLoading(true)
    setError(null)

    try {
      let responseData

      const res = await fetch(
        `/api/google-sheets?sheet=${sheetName}`,
        { method: 'GET' }
      )

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const json = await res.json()
      console.log("API Response:", json)

      if (json.status === 'success') {
        responseData = json.data || []
        setConnected(true)
      } else {
        throw new Error(json.message || 'Unknown error from API')
      }

      setData(responseData)
    } catch (err) {
      console.error("❌ Fetch failed:", err)
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save data back to Google Apps Script.
   */
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
      console.log("Save response:", json)

      if (json.status !== 'success') {
        throw new Error(json.message || 'Save failed')
      }

      return json
    } catch (err) {
      console.error("❌ Save failed:", err)
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