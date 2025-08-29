// Servicio de Google Sheets para el navegador usando la API pública
// Este servicio funciona directamente en el navegador sin necesidad de googleapis

class GoogleSheetsServiceBrowser {
  constructor() {
    this.spreadsheetId = '1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34'
    this.sheetName = 'Organizaciones'
    this.apiKey = null // Se puede configurar una API key pública para solo lectura
    
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      throw new Error('Este servicio solo funciona en el navegador')
    }
  }

  // Obtener todas las organizaciones desde Google Sheets
  async getAllOrganizations() {
    try {
      console.log('Intentando obtener organizaciones desde Google Sheets...')
      
      // Construir la URL de la API pública de Google Sheets
      let url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A2:N`
      
      // Si tienes una API key pública, puedes usarla aquí
      if (this.apiKey) {
        url += `?key=${this.apiKey}`
      }
      
      console.log('URL de la API:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 403) {
          console.error('Error 403: Acceso denegado. Posibles causas:')
          console.error('1. La hoja no es pública')
          console.error('2. Necesitas una API key válida')
          console.error('3. La hoja no existe o el ID es incorrecto')
          console.error('4. Las credenciales de servicio no tienen permisos')
          
          throw new Error(`Acceso denegado (403). La hoja debe ser pública o necesitas una API key válida. 
          
Para solucionarlo:
1. Haz la hoja pública: Compartir → "Cualquier persona con el enlace puede ver"
2. O configura una API key pública en setApiKey()
3. O verifica que el SPREADSHEET_ID sea correcto`)
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
      if (error.message.includes('Acceso denegado') || error.message.includes('Error HTTP')) {
        console.warn('Usando datos de ejemplo debido a problemas de acceso a Google Sheets')
        console.warn('Para usar Google Sheets real, soluciona el problema de acceso')
        return this.getSampleData()
      }
      
      throw new Error(`No se pudieron obtener las organizaciones: ${error.message}`)
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

  // Añadir una nueva organización (simulado por ahora)
  async addOrganization(organization) {
    try {
      console.log('Añadiendo organización:', organization)
      
      // Para implementar escritura real, necesitarías:
      // 1. Una API key con permisos de escritura
      // 2. O un backend que maneje las credenciales
      
      console.warn('Escritura no implementada. Solo lectura disponible.')
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Organización añadida exitosamente (simulado)')
      return true
    } catch (error) {
      console.error('Error al añadir organización:', error)
      throw new Error(`No se pudo añadir la organización: ${error.message}`)
    }
  }

  // Actualizar organización existente (simulado)
  async updateOrganization(organization) {
    try {
      console.log('Actualizando organización:', organization)
      
      console.warn('Escritura no implementada. Solo lectura disponible.')
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Organización actualizada exitosamente (simulado)')
      return true
    } catch (error) {
      console.error('Error al actualizar organización:', error)
      throw new Error(`No se pudo actualizar la organización: ${error.message}`)
    }
  }

  // Eliminar organización (simulado)
  async deleteOrganization(organizationId) {
    try {
      console.log('Eliminando organización:', organizationId)
      
      console.warn('Escritura no implementada. Solo lectura disponible.')
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Organización eliminada exitosamente (simulado)')
      return true
    } catch (error) {
      console.error('Error al eliminar organización:', error)
      throw new Error(`No se pudo eliminar la organización: ${error.message}`)
    }
  }

  // Sincronizar datos locales (simulado)
  async syncWithLocalData(localOrganizations) {
    try {
      console.log('Sincronizando datos locales con Google Sheets...')
      
      console.warn('Escritura no implementada. Solo lectura disponible.')
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Sincronización completada exitosamente (simulado)')
      return true
    } catch (error) {
      console.error('Error en sincronización:', error)
      throw new Error(`No se pudo sincronizar: ${error.message}`)
    }
  }

  // Verificar estado de conexión
  async checkConnection() {
    try {
      console.log('Verificando conexión con Google Sheets...')
      
      // Intentar obtener una fila de datos para verificar la conexión
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A1`
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

  // Configurar API key (opcional)
  setApiKey(apiKey) {
    this.apiKey = apiKey
    console.log('API key configurada')
  }
}

export default new GoogleSheetsServiceBrowser()
