import { useState, useEffect, useCallback } from 'react'
import googleSheetsService from '../services/googleSheetsService'
import { validateEnvironment, ENV_CONFIG } from '../config/environment'

export const useGoogleSheets = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [environmentValid, setEnvironmentValid] = useState(false)

  // Validar el entorno al inicializar
  useEffect(() => {
    const validation = validateEnvironment()
    setEnvironmentValid(validation.isValid)
    
    if (!validation.isValid) {
      console.warn('Problemas de entorno detectados:', validation.issues)
      setError(`Problemas de entorno: ${validation.issues.join(', ')}`)
    }
  }, [])

  // Cargar organizaciones desde Google Sheets
  const loadOrganizations = useCallback(async () => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado')
      return
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return
    }

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
  }, [environmentValid])

  // Añadir nueva organización
  const addOrganization = useCallback(async (organization) => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado, añadiendo a estado local')
      setOrganizations(prev => [...prev, organization])
      return true
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return false
    }

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
  }, [environmentValid])

  // Actualizar organización existente
  const updateOrganization = useCallback(async (organization) => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado, actualizando estado local')
      setOrganizations(prev => 
        prev.map(org => org.id === organization.id ? organization : org)
      )
      return true
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return false
    }

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
  }, [environmentValid])

  // Eliminar organización
  const deleteOrganization = useCallback(async (organizationId) => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado, eliminando de estado local')
      setOrganizations(prev => prev.filter(org => org.id !== organizationId))
      return true
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return false
    }

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
  }, [environmentValid])

  // Sincronizar datos locales con Google Sheets
  const syncWithLocalData = useCallback(async (localOrganizations) => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado')
      return false
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return false
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('Iniciando sincronización con Google Sheets...')
      await googleSheetsService.syncWithLocalData(localOrganizations)
      setOrganizations(localOrganizations)
      setIsConnected(true)
      console.log('Sincronización completada exitosamente con Google Sheets')
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
  }, [environmentValid])

  // Probar conexión con Google Sheets
  const testConnection = useCallback(async () => {
    if (!ENV_CONFIG.googleSheets.enabled) {
      console.log('Google Sheets está deshabilitado')
      return false
    }

    if (!environmentValid) {
      setError('El entorno no está configurado correctamente')
      return false
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('Probando conexión con Google Sheets...')
      await googleSheetsService.createHeaders()
      setIsConnected(true)
      console.log('Conexión con Google Sheets exitosa')
      return true
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido en conexión'
      setError(errorMessage)
      setIsConnected(false)
      console.error('Error en conexión con Google Sheets:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [environmentValid])

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    if (environmentValid && ENV_CONFIG.googleSheets.enabled) {
      loadOrganizations()
    }
  }, [loadOrganizations, environmentValid])

  return {
    organizations,
    loading,
    error,
    isConnected,
    environmentValid,
    googleSheetsEnabled: ENV_CONFIG.googleSheets.enabled,
    loadOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    syncWithLocalData,
    testConnection
  }
}

