import React from 'react'
import MapComponent from './components/MapComponent'
import { useGoogleSheetsSimple } from './hooks/useGoogleSheetsSimple'
import './App.css'

function App() {
  const {
    organizations: googleSheetsOrganizations,
    addOrganization
  } = useGoogleSheetsSimple()

  // Función para añadir organización (se guardará en Google Sheets)
  const handleAddOrganization = async (organization) => {
    const success = await addOrganization(organization)
    if (success) {
      // La organización ya se añadió a Google Sheets a través del hook
      console.log('Organización añadida a Google Sheets')
    }
  }

  return (
    <div className="App">
      <main>
        <MapComponent 
          organizations={googleSheetsOrganizations}
          onAddOrganization={handleAddOrganization}
        />
      </main>
    </div>
  )
}

export default App
