import React, { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import GoogleScriptTester from './test/GoogleScriptTester'
import { useGoogleSheets, SHEET_NAMES } from './hooks/useGoogleSheets'
import './App.css'

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

function App() {
  const [showTester, setShowTester] = useState(false)
  const [currentSheet, setCurrentSheet] = useState(SHEET_NAMES.HOSPITALS)

  // Hook to handle Google Sheets
  const { data, loading, error, connected, fetchData, saveData } = useGoogleSheets(IS_TEST_MODE)

  // State for organizations - now derived from Google Sheets data
  const [organizations, setOrganizations] = useState([])

  // Transform Google Sheets data to the format expected by MapComponent
  useEffect(() => {
    console.log("Raw data from API:", data); // Debug log

    if (data && Array.isArray(data) && data.length > 0) {
      // The hook already returns the processed data array
      const transformedData = data.map(item => {
        let lat = parseFloat(item.Latitude);
        let lng = parseFloat(item.Longitude);

        // Check if coordinates are valid
        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          console.warn('Invalid coordinates for item:', item);
          return null;
        }

        return {
          ID: item.ID || `ID_${Date.now()}_${Math.random()}`,
          Name: item.Name,
          Type: item.Type ? item.Type.toLowerCase() : 'hospital',
          Address: item.Address || '',
          Phone: item.Phone || '',
          Website: item.Website || '',
          Email: item.Email || '',
          Latitude: lat,
          Longitude: lng,
          Country: item.Country || '',
          City: item.City || '',
          Specialty: item.Specialty || '',
          Status: item.Status || 0
        };
      }).filter(org => org !== null);

      console.log("Transformed data:", transformedData);
      setOrganizations(transformedData);
    } else {
      console.log("No valid data found");
      setOrganizations([]);
    }
  }, [data]);

  // Fetch data when sheet changes
  useEffect(() => {
    fetchData(currentSheet)
  }, [currentSheet, fetchData])

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

  // Show loading or error states
  if (loading && organizations.length === 0) {
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
            right: '400px', // Fixed the typo here (was '400 px')
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
            loading={loading}
            error={error}
          />
        </main>
      )}
    </div>
  )
}

export default App