// HOOK LIMPIO - SIN APIS EXTERNAS
// Este hook ha sido limpiado de toda funcionalidad de APIs externas

import { useState, useEffect } from 'react'
import { LOCAL_CONFIG, SHEET_NAMES } from '../config/googleSheets.js'

export const useGoogleSheets = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  // Simular datos de ejemplo
  const getSampleData = (sheetName) => {
    if (sheetName === SHEET_NAMES.HOSPITALS) {
      return [
        {
          ID: 'ID_001',
          Name: 'Hospital de Ejemplo',
          Type: 'Hospital',
          Address: 'Calle Ejemplo 123',
          Phone: '+34 123 456 789',
          Website: 'https://ejemplo.com',
          Email: 'info@ejemplo.com',
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
          Name: 'Asociación de Ejemplo',
          Type: 'Association',
          Address: 'Avenida Ejemplo 456',
          Phone: '+34 987 654 321',
          Website: 'https://asociacion-ejemplo.com',
          Email: 'contacto@asociacion-ejemplo.com',
          Latitude: 40.4168,
          Longitude: -3.7038,
          Country: 'España',
          City: 'Madrid',
          Specialty: 'Salud',
          Status: 1
        }
      ]
    }
    
    return []
  }

  // Obtener datos (ahora retorna datos de ejemplo)
  const fetchData = async (sheetName = SHEET_NAMES.HOSPITALS) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const sampleData = getSampleData(sheetName)
      setData(sampleData)
      setConnected(false) // Siempre false porque no hay conexión real
      
    } catch (err) {
      setError('Error al obtener datos de ejemplo')
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  // Guardar datos (ahora solo simula la operación)
  const saveData = async (newData) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Datos que se habrían guardado:', newData)
      
      // Simular éxito
      setData(prevData => [...prevData, newData])
      
      return {
        status: 'success',
        message: 'Servicio en modo simulación - datos no guardados'
      }
      
    } catch (err) {
      setError('Error al simular guardado de datos')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Verificar conexión (ahora siempre retorna false)
  const testConnection = async () => {
    setLoading(true)
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = {
        connected: false,
        message: 'Servicio limpiado - no hay conexión a APIs externas'
      }
      
      setConnected(result.connected)
      return result
      
    } catch (err) {
      const result = {
        connected: false,
        message: 'Error al verificar conexión'
      }
      
      setConnected(result.connected)
      return result
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    connected,
    fetchData,
    saveData,
    testConnection
  }
}

