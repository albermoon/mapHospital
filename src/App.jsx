import React, { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import { useGoogleSheets, SHEET_NAMES } from './hooks/useGoogleSheets'
import LanguageSelector from './components/LanguageSelector'
import GoogleSheetsStatus from './components/GoogleSheetsStatus'
import { useTranslation } from './utils/i18n'
import './App.css'

function App() {
  const { t } = useTranslation()
  const { data, loading, error, fetchData, saveData } = useGoogleSheets()

  const [organizations, setOrganizations] = useState([])
  const [localOrganizations, setLocalOrganizations] = useState([])
  const [sheetData, setSheetData] = useState({})
  const [currentSheet, setCurrentSheet] = useState(SHEET_NAMES.HOSPITALES)

  const [loadingSheets, setLoadingSheets] = useState({
    [SHEET_NAMES.HOSPITALES]: true,
    [SHEET_NAMES.ASOCIACIONES]: true
  })

  const transformSheet = (sheetArray) => {
    const typeMappings = {
      hospital: ['hospital', 'hospitales', 'clinica', 'centro medico'],
      association: ['socio', 'miembro']
    }

    const normalize = (str) =>
      str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : ''

    return sheetArray
      .map(item => {
        const lat = parseFloat(item.Latitude)
        const lng = parseFloat(item.Longitude)
        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null

        const rawType = normalize(item.Type)
        const mappedType =
          Object.entries(typeMappings).find(([_, values]) => values.includes(rawType))?.[0] || 'association'

        return {
          id: item.ID,
          name: item.Name,
          type: mappedType,
          address: item.Address || '',
          phone: item.Phone || '',
          website: item.Website || '',
          email: item.Email || '',
          coordinates: [lat, lng],
          country: item.Country || '',
          city: item.City || '',
          speciality: item.Speciality || '',
          status: item.Status || 0
        }
      })
      .filter(org => org !== null && org.status === 1)
  }

  useEffect(() => {
    const loadSheets = async () => {
      try {
        const [hospitalesData, asociacionesData] = await Promise.all([
          fetchData(SHEET_NAMES.HOSPITALES),
          fetchData(SHEET_NAMES.ASOCIACIONES)
        ])

        const [transformedHosp, transformedAssoc] = await Promise.all([
          Promise.resolve(transformSheet(hospitalesData)),
          Promise.resolve(transformSheet(asociacionesData))
        ])

        setSheetData(prev => ({
          ...prev,
          [SHEET_NAMES.HOSPITALES]: transformedHosp,
          [SHEET_NAMES.ASOCIACIONES]: transformedAssoc
        }))

        setLoadingSheets({
          [SHEET_NAMES.HOSPITALES]: false,
          [SHEET_NAMES.ASOCIACIONES]: false
        })

      } catch (err) {
        console.error('Error fetching sheets', err)
      }
    }

    loadSheets()
  }, [fetchData])

  useEffect(() => {
    const allLoaded = Object.values(loadingSheets).every(v => v === false)
    if (allLoaded) {
      const merged = Object.values(sheetData).flat()
      setOrganizations(merged)
    }
  }, [loadingSheets, sheetData])

  const handleAddOrganization = async (organization) => {
    setLocalOrganizations(prev => [...prev, organization])
    setOrganizations(prev => [...prev, organization])

    try {
      const res = await saveData({
        Name: organization.name,
        Type: organization.type,
        Address: organization.address,
        Phone: organization.phone,
        Website: organization.website,
        Email: organization.email,
        Latitude: organization.coordinates[0],
        Longitude: organization.coordinates[1],
        Country: organization.country,
        City: organization.city,
        Speciality: organization.speciality,
        Status: 0
      })

      if (res.newId) {
        setOrganizations(prev =>
          prev.map(org => org === organization ? { ...org, id: res.newId } : org)
        )
      }

      console.log('Saved to Google Sheets!')
    } catch (err) {
      console.error('Failed to save to Google Sheets:', err)
      setLocalOrganizations(prev => prev.filter(org => org !== organization))
      setOrganizations(prev => prev.filter(org => org !== organization))
    }
  }

  const handleSheetChange = (sheetName) => setCurrentSheet(sheetName)
  const handleSyncWithLocal = () => alert("Sync functionality would be implemented here")

  // Overlay stays until all sheets finish
  const anySheetLoading = Object.values(loadingSheets).some(v => v === true)

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
          loading={anySheetLoading}
          error={error}
          onSyncWithLocal={handleSyncWithLocal}
          localOrganizations={localOrganizations}
        />

        <div className="map-container">
          <MapComponent
            organizations={organizations}
            onAddOrganization={handleAddOrganization}
            loading={anySheetLoading}
            error={error}
          />

          {anySheetLoading && (
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
