import React, { useState } from 'react'
import MapComponent from './components/MapComponent'
import GoogleScriptTester from './test/GoogleScriptTester'
import { useGoogleSheets } from './hooks/useGoogleSheets'
import './App.css'

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

function App() {
  const [showTester, setShowTester] = useState(false)

  // Hook to handle Google Sheets
  const { saveData } = useGoogleSheets(IS_TEST_MODE)

  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: "Hospital de Ejemplo",
      type: "hospital",
      address: "Calle Ejemplo 123, Madrid",
      phone: "+34 123 456 789",
      website: "https://ejemplo.com",
      email: "info@ejemplo.com",
      coordinates: [40.4168, -3.7038],
      country: "España",
      city: "Madrid",
      specialty: "General",
      status: 1
    },
    {
      id: 2,
      name: "Asociación de Ejemplo",
      type: "association",
      address: "Avenida Ejemplo 456, Madrid",
      phone: "+34 987 654 321",
      website: "https://asociacion-ejemplo.com",
      email: "contacto@asociacion-ejemplo.com",
      coordinates: [40.4168, -3.7038],
      country: "España",
      city: "Madrid",
      specialty: "Salud",
      status: 1
    }
  ])

  const handleAddOrganization = async (organization) => {
    const newOrganization = { ...organization, id: Date.now() }
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
      })
      console.log('Saved to Google Sheets!')
    } catch (err) {
      console.error('Failed to save to Google Sheets:', err)
    }
  }

  return (
    <div className="App">
      {IS_TEST_MODE && (
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
      )}

      {IS_TEST_MODE && showTester ? (
        <GoogleScriptTester />
      ) : (
        <main>
          <MapComponent
            organizations={organizations}
            onAddOrganization={handleAddOrganization}
          />
        </main>
      )}
    </div>
  )
}

export default App
