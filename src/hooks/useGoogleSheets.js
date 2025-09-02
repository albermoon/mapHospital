import { useState, useEffect } from 'react'

// Production URL (replace with deployed Apps Script URL)
const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || ''

export const SHEET_NAMES = {
  HOSPITALS: 'Hospitales',
  ASSOCIATIONS: 'Asociaciones'
}

export const useGoogleSheets = (useTestMode = false) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  // Sample data for test mode
  const getSampleData = (sheetName) => {
    if (sheetName === SHEET_NAMES.HOSPITALS) {
      return [
        {
          ID: 'ID_001',
          Name: 'Example Hospital',
          Type: 'Hospital',
          Address: 'Example Street 123',
          Phone: '+34 123 456 789',
          Website: 'https://example.com',
          Email: 'info@example.com',
          Latitude: 40.4168,
          Longitude: -3.7038,
          Country: 'España',
          City: 'Madrid',
          Specialty: 'General',
          Status: 1
        }
      ]
    } else if (sheetName === SHEET_NAMES.ASSOCIATIONS) {
      return [
        {
          ID: 'ID_002',
          Name: 'Example Association',
          Type: 'Association',
          Address: 'Example Avenue 456',
          Phone: '+34 987 654 321',
          Website: 'https://association-example.com',
          Email: 'contact@association-example.com',
          Latitude: 40.4168,
          Longitude: -3.7038,
          Country: 'España',
          City: 'Madrid',
          Specialty: 'Health',
          Status: 1
        }
      ]
    }
    return []
  }

  const callGoogleScript = async (payload) => {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL not configured')
    }

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const result = await response.json()
    if (result.status === 'error') throw new Error(result.message)

    return result
  }

  const fetchData = async (sheetName = SHEET_NAMES.HOSPITALS) => {
    setLoading(true)
    setError(null)
    try {
      if (useTestMode) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setData(getSampleData(sheetName))
        setConnected(false)
      } else {
        // TODO: real fetch GET endpoint
        setData(getSampleData(sheetName))
        setConnected(true)
      }
    } catch (err) {
      setError(err.message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async (newData) => {
    setLoading(true)
    setError(null)
    try {
      if (useTestMode) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setData(prev => [...prev, newData])
        return { status: 'success', message: 'Test mode - not saved' }
      } else {
        const result = await callGoogleScript(newData)
        if (result.status === 'success') setData(prev => [...prev, newData])
        return result
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Only expose test functions if in test mode
  const api = {
    data,
    loading,
    error,
    connected,
    fetchData,
    saveData,
    useTestMode
  }

  if (useTestMode) {
    api.testConnection = async () => {
      await new Promise(r => setTimeout(r, 500))
      return { connected: false, message: 'Test mode - no real connection' }
    }
  }

  useEffect(() => { fetchData() }, [useTestMode])

  return api
}
