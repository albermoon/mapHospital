import { useState, useEffect, useCallback } from 'react'
import googleSheetsService from '../services/googleSheetsServiceSimple'

export const useGoogleSheetsSimple = () => {
  const [organizations, setOrganizations] = useState([])

  // Cargar organizaciones desde Google Sheets
  const loadOrganizations = useCallback(async () => {
    try {
      console.log('Iniciando carga de organizaciones desde Google Sheets...')
      const data = await googleSheetsService.getAllOrganizations()
      setOrganizations(data)
      console.log('Organizaciones cargadas exitosamente desde Google Sheets:', data)
    } catch (err) {
      console.error('Error al cargar organizaciones:', err)
    }
  }, [])

  // Añadir nueva organización
  const addOrganization = useCallback(async (organization) => {
    try {
      console.log('Añadiendo organización:', organization)
      await googleSheetsService.addOrganization(organization)
      setOrganizations(prev => [...prev, organization])
      console.log('Organización añadida exitosamente')
      return true
    } catch (err) {
      console.error('Error al añadir organización:', err)
      
      // Fallback: añadir a estado local si falla Google Sheets
      console.log('Fallback: añadiendo organización a estado local')
      setOrganizations(prev => [...prev, organization])
      return false
    }
  }, [])

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  return {
    organizations,
    addOrganization
  }
}
