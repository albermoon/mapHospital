import React, { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import GoogleScriptTester from './test/GoogleScriptTester'
import { useGoogleSheets, SHEET_NAMES } from './hooks/useGoogleSheets'
import LanguageSelector from './components/LanguageSelector'
import { useTranslation } from './utils/i18n'
import './App.css'

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

function App() {
  const [showTester, setShowTester] = useState(false)
  const [currentSheet, setCurrentSheet] = useState(SHEET_NAMES.HOSPITALS)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { t } = useTranslation()

  // Hook to handle Google Sheets
  const { data, loading, error, connected, fetchData, saveData } = useGoogleSheets(IS_TEST_MODE)

  // State for organizations
  const [organizations, setOrganizations] = useState([])

  // Fetch data on initial load and when sheet changes
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData(currentSheet)
        setIsInitialLoad(false)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }

    loadData()
  }, [currentSheet, fetchData])

  useEffect(() => {
    console.log("Raw data from API:", data);

    if (data && Array.isArray(data) && data.length > 0) {
      const transformedData = data
        .map(item => {
          let lat = parseFloat(item.Latitude);
          let lng = parseFloat(item.Longitude);

          // Check if coordinates are valid
          if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            console.warn('Invalid coordinates for item:', item);
            return null;
          }

          // Normalize type
          let type = (item.Type || '').trim().toLowerCase();

          if (['hospital', 'hospitales'].includes(type)) {
            type = 'hospital';
          } else if (['association', 'associations', 'asociación', 'asociacion'].includes(type)) {
            type = 'association';
          } else {
            console.warn('Unknown organization type, keeping raw value:', item.Type);
            type = type || 'hospital'; // fallback only if empty
          }

          return {
            id: item.ID || `ID_${Date.now()}_${Math.random()}`,
            name: item.Name,
            type: type,
            address: item.Address || '',
            phone: item.Phone || '',
            website: item.Website || '',
            email: item.Email || '',
            coordinates: [lat, lng],
            country: item.Country || '',
            city: item.City || '',
            specialty: item.Specialty || '',
            status: item.Status || 0
          };
        })
        .filter(org => org !== null);

      console.log("Transformed data:", transformedData);
      setOrganizations(transformedData);
    } else {
      console.log("No valid data found");
      setOrganizations([]);
    }
  }, [data]);

  const handleAddOrganization = async (organization) => {
    const newOrganization = { ...organization, id: Date.now() }

    // Optimistically update local state
    setOrganizations(prev => [...prev, newOrganization])
    console.log('Local add:', newOrganization)

    try {
      await saveData({
        ID: `ID_${Date.now()}`,
        Name: newOrganization.name,
        Type: newOrganization.type,
        Address: newOrganization.address,
        Phone: newOrganization.phone,
        Website: newOrganization.website,
        Email: newOrganization.email,
        Latitude: newOrganization.coordinates[0],
        Longitude: newOrganization.coordinates[1],
        Country: newOrganization.country,
        City: newOrganization.city,
        Specialty: newOrganization.specialty,
        Status: 1
      })
      console.log('Saved to Google Sheets!')

    } catch (err) {
      console.error('Failed to save to Google Sheets:', err)
      setOrganizations(prev => prev.filter(org => org.id !== newOrganization.id))
    }
  }

  const handleSheetChange = (sheetName) => {
    setCurrentSheet(sheetName)
  }

  // Show loading only on initial load
  if (isInitialLoad && organizations.length === 0) {
    return (
      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}>
          <div>Loading organizations...</div>
          {IS_TEST_MODE && <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Test Mode: {connected ? 'Connected' : 'Using sample data'}
          </div>}
        </div>
      </div>
    )
  }

  // Show error state
  if (error && organizations.length === 0) {
    return (
      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          color: 'red'
        }}>
          <div>Error loading data: {error}</div>
          <button
            onClick={() => fetchData(currentSheet)}
            style={{ marginTop: '10px', padding: '5px 10px' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {/* Header with title and language selector */}
      <header className="App-header">
        <h1>{t('appTitle')}</h1>
        <LanguageSelector />
      </header>

      {IS_TEST_MODE && (
        <>
          <button
            onClick={() => setShowTester(!showTester)}
            style={{
              position: 'fixed',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showTester ? 'Hide Tester' : 'Show Script Tester'}
          </button>

          {/* Sheet selector for test mode */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '400px',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <label>Sheet: </label>
            <select
              value={currentSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              style={{ marginLeft: '5px' }}
            >
              <option value={SHEET_NAMES.HOSPITALS}>Hospitals</option>
              <option value={SHEET_NAMES.ASSOCIATIONS}>Associations</option>
            </select>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
              {connected ? '🟢 Connected' : '🔴 Test Mode'} | {organizations.length} items
            </div>
          </div>
        </>
      )}

      {IS_TEST_MODE && showTester ? (
        <GoogleScriptTester />
      ) : (
        <main>
          <MapComponent
            organizations={organizations}
            onAddOrganization={handleAddOrganization}
            loading={loading && organizations.length === 0}
            error={error}
          />
        </main>
      )}
    </div>
  )
}

export default App