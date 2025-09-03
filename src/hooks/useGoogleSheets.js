import { useState, useEffect } from 'react'

export const SHEET_NAMES = {
  HOSPITALS: 'Hospitales',
  ASSOCIATIONS: 'Asociaciones'
}

export const useGoogleSheets = (useTestMode = false) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  const GOOGLE_APPS_SCRIPT_URL = useTestMode ? '' : import.meta.env.VITE_GOOGLE_SCRIPT_URL

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

  // POST request to Google Script via proxy
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

  // GET request to fetch data
  const fetchData = async (sheetName = SHEET_NAMES.HOSPITALS) => {
    setLoading(true);
    setError(null);
    try {
      if (useTestMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(getSampleData(sheetName));
        setConnected(false);
      } else {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        console.log("API Response:", result); // Debug log

        if (result.status === 'error') throw new Error(result.message);

        // Get the data from the response - it's now in result.data array
        const responseData = result.data || [];
        
        // Filter based on sheet name (type)
        const filteredData = responseData.filter(item => {
          const itemType = (item.Type || "").toLowerCase();
          if (sheetName === SHEET_NAMES.HOSPITALS) return itemType === 'hospital';
          if (sheetName === SHEET_NAMES.ASSOCIATIONS) return itemType === 'association';
          return false;
        });

        console.log("Filtered data:", filteredData); // Debug log
        setData(filteredData);
        setConnected(true);
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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
        if (result.status === 'success') {
          // Refresh data after saving
          fetchData();
        }
        return result
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Hook API
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

  useEffect(() => { 
    if (!useTestMode) {
      fetchData(SHEET_NAMES.HOSPITALS); 
    }
  }, [useTestMode])

  return api
}