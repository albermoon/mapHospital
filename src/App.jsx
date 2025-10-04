import React, { useState, useEffect, useMemo, useCallback } from 'react'
import MapComponent from './components/MapComponent'
import { useGoogleSheets, SHEET_NAMES } from './hooks/useGoogleSheets'
import LanguageSelector from './components/LanguageSelector'
import GoogleSheetsStatus from './components/GoogleSheetsStatus'
import { useTranslation } from './utils/i18n'
import './App.css'

function App() {
  const [currentSheet, setCurrentSheet] = useState(SHEET_NAMES.HOSPITALES)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { t } = useTranslation()

  // Hook to handle Google Sheets
  const { data, loading, error, connected, fetchData, saveData } = useGoogleSheets()

  // State for organizations
  const [organizations, setOrganizations] = useState([])
  const [localOrganizations, setLocalOrganizations] = useState([])

  // Fetch data on initial load and when sheet changes
  useEffect(() => {
    const loadData = async () => {
      // Start timing the overall app loading process
      const appLoadStartTime = performance.now()
      console.log(`🚀 Starting app load for sheet: ${currentSheet}`)

      try {
        await fetchData(currentSheet)
        setIsInitialLoad(false)

        // End timing the overall app loading process
        const appLoadEndTime = performance.now()
        const appLoadDuration = appLoadEndTime - appLoadStartTime
        console.log(`⏱️ App load completed in ${appLoadDuration.toFixed(2)}ms`)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }

    loadData()
  }, [currentSheet, fetchData])

  // Memoize data transformation to prevent unnecessary recalculations
  const transformedOrganizations = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("No valid data found");
      return [];
    }

    // Start timing the data transformation process
    const transformStartTime = performance.now()
    console.log(`🔄 Starting data transformation for ${data.length} items`)

    const transformedData = data
      .map(item => {
        let lat = parseFloat(item.Latitude);
        let lng = parseFloat(item.Longitude);

        // Check if coordinates are valid
        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          console.warn('Invalid coordinates for item:', item.Name || 'Unknown', 'Lat:', item.Latitude, 'Lng:', item.Longitude);
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

    // End timing the data transformation process
    const transformEndTime = performance.now()
    const transformDuration = transformEndTime - transformStartTime
    console.log(`⏱️ Data transformation completed in ${transformDuration.toFixed(2)}ms`)
    console.log(`📊 Transformed ${transformedData.length} valid organizations`)

    return transformedData;
  }, [data]);

  // Update organizations when transformed data changes
  useEffect(() => {
    setOrganizations(transformedOrganizations);
  }, [transformedOrganizations]);

  const handleAddOrganization = async (organization) => {
    const newOrganization = {
      ...organization,
      id: `ID_${Date.now()}_${Math.random()}`
    }

    // Add to local state
    setLocalOrganizations(prev => [...prev, newOrganization])
    setOrganizations(prev => [...prev, newOrganization])

    console.log('Local add:', newOrganization)

    try {
      await saveData({
        ID: newOrganization.id,
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
      // Revert local changes if save fails
      setLocalOrganizations(prev => prev.filter(org => org.id !== newOrganization.id))
      setOrganizations(prev => prev.filter(org => org.id !== newOrganization.id))
    }
  }

  const handleSheetChange = (sheetName) => {
    setCurrentSheet(sheetName)
  }

  const handleSyncWithLocal = (localOrgs) => {
    // Implement synchronization logic here
    console.log("Syncing local organizations:", localOrgs);
    // This would typically send local organizations to Google Sheets
    alert("Sync functionality would be implemented here");
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
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            🏥 Loading Hospital Map...
          </div>
          <div style={{ 
            width: '300px', 
            height: '6px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#007bff',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Status: {connected ? 'Connected' : 'Connecting to Google Sheets...'}
          </div>
          <div style={{ marginTop: '5px', fontSize: '11px', color: '#999' }}>
            This may take a few seconds for large datasets
          </div>
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

      <main>
        <GoogleSheetsStatus
          loading={loading}
          error={error}
          onSyncWithLocal={handleSyncWithLocal}
          localOrganizations={localOrganizations}
        />
        <MapComponent
          organizations={organizations}
          onAddOrganization={handleAddOrganization}
          loading={loading && organizations.length === 0}
          error={error}
        />
      </main>
    </div>
  )
}

export default App