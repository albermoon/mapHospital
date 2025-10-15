import React, { useState, useEffect, useMemo, useRef } from 'react'
import MapComponent from './components/MapComponent'
import { useGoogleSheets, SHEET_NAMES } from './hooks/useGoogleSheets'
import LanguageSelector from './components/LanguageSelector'
import GoogleSheetsStatus from './components/GoogleSheetsStatus'
import { useTranslation } from './utils/i18n'
import './App.css'

function App() {
  const [currentSheet, setCurrentSheet] = useState(SHEET_NAMES.HOSPITALES)
  const [hasSwitchedToAsociaciones, setHasSwitchedToAsociaciones] = useState(false)
  const { t } = useTranslation()
  const hasSwitchedRef = useRef(false)

  const { data, loading, error, connected, fetchData, saveData } = useGoogleSheets()

  const [organizations, setOrganizations] = useState([])
  const [localOrganizations, setLocalOrganizations] = useState([])

  // Load data on sheet change
  useEffect(() => {
    const loadData = async () => {
      console.log(`🚀 Starting app load for sheet: ${currentSheet}`)
      try {
        await fetchData(currentSheet)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    loadData()
  }, [currentSheet, fetchData])

  // Fallback to Asociaciones if Hospitales is empty
  useEffect(() => {
    if (!loading && !error && Array.isArray(data)) {
      if (data.length <= 1 && currentSheet === SHEET_NAMES.HOSPITALES && !hasSwitchedRef.current) {
        console.warn('⚠️ No data found in Hospitales, switching to Asociaciones...')
        hasSwitchedRef.current = true
        setCurrentSheet(SHEET_NAMES.ASOCIACIONES)
      }
    }
  }, [data, loading, error, currentSheet])

  // Helper: normalize text
  const normalize = (str) =>
    str
      ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      : ''

  // Transform raw data into organizations
  const transformedOrganizations = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return []

    const typeMappings = {
      hospital: ['hospital', 'hospitales', 'clinica', 'centro medico'],
      association: [
        'socio', 'miembro'
      ]
    }

    return data
      .map(item => {
        const lat = parseFloat(item.Latitude)
        const lng = parseFloat(item.Longitude)

        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null

        const rawType = normalize(item.Type)
        const mappedType =
          Object.entries(typeMappings).find(([_, values]) => values.includes(rawType))?.[0] || 'association'

        return {
          id: item.ID || `ID_${Date.now()}_${Math.random()}`,
          name: item.Name,
          type: mappedType,
          address: item.Address || '',
          phone: item.Phone || '',
          website: item.Website || '',
          email: item.Email || '',
          coordinates: [lat, lng],
          country: item.Country || '',
          city: item.City || '',
          specialty: item.Specialty || '',
          status: item.Status || 0
        }
      })
      .filter(org => org !== null)
  }, [data])

  // Update organizations when transformed data changes
  useEffect(() => {
    setOrganizations(prevOrgs => {
      // Create a map of existing org IDs
      const orgMap = new Map(prevOrgs.map(o => [o.id, o]))
      // Add/overwrite with new transformed organizations
      transformedOrganizations.forEach(org => orgMap.set(org.id, org))
      return Array.from(orgMap.values())
    })
  }, [transformedOrganizations])

  // Add new organization
  const handleAddOrganization = async (organization) => {
    const newOrganization = { ...organization, id: `ID_${Date.now()}_${Math.random()}` }
    setLocalOrganizations(prev => [...prev, newOrganization])
    setOrganizations(prev => [...prev, newOrganization])

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
      setLocalOrganizations(prev => prev.filter(org => org.id !== newOrganization.id))
      setOrganizations(prev => prev.filter(org => org.id !== newOrganization.id))
    }
  }

  const handleSheetChange = (sheetName) => setCurrentSheet(sheetName)
  const handleSyncWithLocal = (localOrgs) => alert("Sync functionality would be implemented here")

  return (
    <div className="App">
      <header className="App-header">
        <h1>{t('appTitle')}</h1>
        <LanguageSelector />
      </header>

      <main>
        <div style={{ margin: '10px 0' }}>
          <label>
            Select sheet:
            <select
              value={currentSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              {Object.values(SHEET_NAMES).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        <GoogleSheetsStatus
          loading={loading}
          error={error}
          onSyncWithLocal={handleSyncWithLocal}
          localOrganizations={localOrganizations}
        />

        <div className="map-container">
          <MapComponent
            organizations={organizations}
            onAddOrganization={handleAddOrganization}
            loading={loading} // Map itself can optionally use this
            error={error}
          />

          {/* Transparent overlay while loading */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '6px solid #ccc',
                borderTop: '6px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
