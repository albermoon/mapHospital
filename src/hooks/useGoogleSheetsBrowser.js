import { useState, useEffect, useCallback } from 'react'
import googleSheetsService from '../services/googleSheetsServiceBrowser'

export const useGoogleSheetsBrowser = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [environmentValid, setEnvironmentValid] = useState(true) // Siempre válido en el navegador

  // Cargar organizaciones desde Google Sheets
  const loadOrganizations = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Iniciando carga de organizaciones desde Google Sheets...')
      const data = await googleSheetsService.getAllOrganizations()
      setOrganizations(data)
      setIsConnected(true)
      console.log('Organizaciones cargadas exitosamente desde Google Sheets:', data)
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al cargar organizaciones'
      setError(errorMessage)
      setIsConnected(false)
      console.error('Error al cargar organizaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Añadir nueva organización
  const addOrganization = useCallback(async (organization) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Añadiendo organización a Google Sheets:', organization)
      await googleSheetsService.addOrganization(organization)
      setOrganizations(prev => [...prev, organization])
      console.log('Organización añadida exitosamente a Google Sheets')
      return true
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al añadir organización'
      setError(errorMessage)
      console.error('Error al añadir organización:', err)
      
      // Fallback: añadir a estado local si falla Google Sheets
      console.log('Fallback: añadiendo organización a estado local')
      setOrganizations(prev => [...prev, organization])
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Actualizar organización existente
  const updateOrganization = useCallback(async (organization) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Actualizando organización en Google Sheets:', organization)
      await googleSheetsService.updateOrganization(organization)
      setOrganizations(prev => 
        prev.map(org => org.id === organization.id ? organization : org)
      )
      console.log('Organización actualizada exitosamente en Google Sheets')
      return true
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al actualizar organización'
      setError(errorMessage)
      console.error('Error al actualizar organización:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Eliminar organización
  const deleteOrganization = useCallback(async (organizationId) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Eliminando organización de Google Sheets:', organizationId)
      await googleSheetsService.deleteOrganization(organizationId)
      setOrganizations(prev => prev.filter(org => org.id !== organizationId))
      console.log('Organización eliminada exitosamente de Google Sheets')
      return true
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al eliminar organización'
      setError(errorMessage)
      console.error('Error al eliminar organización:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Sincronizar datos locales
  const syncWithLocalData = useCallback(async (localOrganizations) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Iniciando sincronización con Google Sheets...')
      await googleSheetsService.syncWithLocalData(localOrganizations)
      setOrganizations(localOrganizations)
      setIsConnected(true)
      console.log('Sincronización completada exitosamente')
      return true
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido en sincronización'
      setError(errorMessage)
      setIsConnected(false)
      console.error('Error en sincronización:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Probar conexión
  const testConnection = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Probando conexión con Google Sheets...')
      const result = await googleSheetsService.checkConnection()
      
      if (result.connected) {
        setIsConnected(true)
        console.log('Conexión exitosa:', result.message)
      } else {
        setIsConnected(false)
        setError(result.message)
      }
      
      return result.connected
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido en conexión'
      setError(errorMessage)
      setIsConnected(false)
      console.error('Error en conexión:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  return {
    organizations,
    loading,
    error,
    isConnected,
    environmentValid,
    loadOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    syncWithLocalData,
    testConnection
  }
}
