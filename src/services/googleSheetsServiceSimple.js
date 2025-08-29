// Servicio simplificado de Google Sheets usando solo API Key pública
// Este servicio evita los problemas de autenticación compleja

import { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID, SHEET_NAMES, COLUMN_CONFIG } from '../config/googleSheetsSimple.js'

class GoogleSheetsServiceSimple {
  constructor() {
    this.spreadsheetId = SPREADSHEET_ID
    this.sheetName = SHEET_NAMES.ORGANIZATIONS
    this.apiKey = GOOGLE_SHEETS_API_KEY
    
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      throw new Error('Este servicio solo funciona en el navegador')
    }
    
    // Verificar configuración
    if (!this.apiKey || this.apiKey === 'TU_API_KEY_AQUI') {
      console.warn('API Key no configurada. Usando datos de ejemplo.')
    }
    
    if (!this.spreadsheetId || this.spreadsheetId === 'TU_SPREADSHEET_ID_AQUI') {
      console.warn('Spreadsheet ID no configurado. Usando datos de ejemplo.')
    }
  }

  // Obtener todas las organizaciones desde Google Sheets
  async getAllOrganizations() {
    try {
      // Si no hay configuración válida, usar datos de ejemplo
      if (!this.apiKey || this.apiKey === 'TU_API_KEY_AQUI' || 
          !this.spreadsheetId || this.spreadsheetId === 'TU_SPREADSHEET_ID_AQUI') {
        console.warn('Configuración incompleta. Usando datos de ejemplo.')
        return this.getSampleData()
      }
      
      console.log('Intentando obtener organizaciones desde Google Sheets...')
      
      // Construir la URL de la API con API key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A2:N?key=${this.apiKey}`
      
      console.log('URL de la API:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 403) {
          console.error('Error 403: Acceso denegado. Posibles causas:')
          console.error('1. La API key no es válida')
          console.error('2. La hoja no es accesible')
          console.error('3. El proyecto no tiene Google Sheets API habilitada')
          
          throw new Error(`Acceso denegado (403). Verifica:
          1. Que tu API key sea válida
          2. Que hayas habilitado Google Sheets API en tu proyecto
          3. Que la hoja sea accesible`)
        }
        
        if (response.status === 404) {
          throw new Error('Hoja no encontrada. Verifica que el SPREADSHEET_ID sea correcto.')
        }
        
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      const rows = data.values || []
      
      console.log('Filas obtenidas de Google Sheets:', rows)
      
      if (rows.length === 0) {
        console.warn('No se encontraron datos en la hoja. Verifica que la hoja tenga datos.')
        return []
      }
      
      return rows.map((row, index) => {
        const [id, name, type, description, address, phone, website, email, lat, lng, country, city, beds, specialties] = row
        
        return {
          id: parseInt(id) || index + 1,
          name: name || '',
          type: type || 'hospital',
          description: description || '',
          address: address || '',
          phone: phone || null,
          website: website || null,
          email: email || null,
          coordinates: lat && lng ? [parseFloat(lat), parseFloat(lng)] : null,
          country: country || '',
          city: city || '',
          beds: beds ? parseInt(beds) : null,
          specialties: specialties ? specialties.split(',').map(s => s.trim()) : []
        }
      }).filter(org => org.name) // Filtrar filas vacías
      
    } catch (error) {
      console.error('Error al obtener organizaciones:', error)
      
      // Si falla la conexión real, mostrar datos de ejemplo
      console.warn('Usando datos de ejemplo debido a problemas de acceso a Google Sheets')
      return this.getSampleData()
    }
  }

  // Datos de ejemplo para desarrollo
  getSampleData() {
    return [
      {
        id: 1,
        name: "European Patients' Forum (EPF)",
        type: "association",
        description: "Organización líder que representa a pacientes en Europa",
        address: "Rue du Trône 60, 1050 Brussels, Belgium",
        phone: "+32 2 280 23 34",
        website: "https://www.eu-patient.eu",
        email: "info@eu-patient.eu",
        coordinates: [50.8503, 4.3517],
        country: "Belgium",
        city: "Brussels"
      },
      {
        id: 2,
        name: "Alianza General de Pacientes (AGP)",
        type: "association",
        description: "Asociación española de defensa de los derechos de los pacientes",
        address: "Calle de la Princesa 25, 28008 Madrid, Spain",
        phone: "+34 91 541 80 00",
        website: "https://www.agp.es",
        email: "info@agp.es",
        coordinates: [40.4168, -3.7038],
        country: "Spain",
        city: "Madrid"
      },
      {
        id: 3,
        name: "Charité - Universitätsmedizin Berlin",
        type: "hospital",
        description: "Uno de los hospitales universitarios más grandes de Europa",
        address: "Charitéplatz 1, 10117 Berlin, Germany",
        phone: "+49 30 450 50",
        website: "https://www.charite.de",
        email: "info@charite.de",
        coordinates: [52.5200, 13.4050],
        country: "Germany",
        city: "Berlin",
        beds: 3000,
        specialties: ["Cardiología", "Neurología", "Oncología", "Traumatología"]
      }
    ]
  }

  // Verificar estado de conexión
  async checkConnection() {
    try {
      // Si no hay configuración válida
      if (!this.apiKey || this.apiKey === 'TU_API_KEY_AQUI' || 
          !this.spreadsheetId || this.spreadsheetId === 'TU_SPREADSHEET_ID_AQUI') {
        return {
          connected: false,
          message: 'Configuración incompleta. Configura tu API key y Spreadsheet ID.',
          mode: 'config_needed'
        }
      }
      
      console.log('Verificando conexión con Google Sheets...')
      
      // Intentar obtener una fila de datos para verificar la conexión
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A1?key=${this.apiKey}`
      const response = await fetch(url)
      
      if (response.ok) {
        return {
          connected: true,
          message: 'Conexión exitosa con Google Sheets',
          mode: 'readonly'
        }
      } else {
        return {
          connected: false,
          message: `Error HTTP: ${response.status}`,
          mode: 'error'
        }
      }
      
    } catch (error) {
      console.error('Error al verificar conexión:', error)
      return {
        connected: false,
        message: error.message,
        mode: 'error'
      }
    }
  }

  // Métodos simulados para mantener compatibilidad
  async addOrganization(organization) {
    console.warn('Escritura no disponible con API key pública. Solo lectura.')
    return true
  }

  async updateOrganization(organization) {
    console.warn('Escritura no disponible con API key pública. Solo lectura.')
    return true
  }

  async deleteOrganization(organizationId) {
    console.warn('Escritura no disponible con API key pública. Solo lectura.')
    return true
  }

  async syncWithLocalData(localOrganizations) {
    console.warn('Escritura no disponible con API key pública. Solo lectura.')
    return true
  }
}

export default new GoogleSheetsServiceSimple()
