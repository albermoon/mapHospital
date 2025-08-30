import React, { useState } from 'react'
import MapComponent from './components/MapComponent'
import './App.css'

function App() {
  // Estado local para las organizaciones
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

  // Función para añadir organización (se guardará en estado local)
  const handleAddOrganization = async (organization) => {
    const newOrganization = {
      ...organization,
      id: Date.now() // ID único simple
    }
    
    setOrganizations(prev => [...prev, newOrganization])
    console.log('Organización añadida localmente:', newOrganization)
    
    return true
  }

  return (
    <div className="App">
      <main>
        <MapComponent 
          organizations={organizations}
          onAddOrganization={handleAddOrganization}
        />
      </main>
    </div>
  )
}

export default App
