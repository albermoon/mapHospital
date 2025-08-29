import { google } from 'googleapis'
import { GOOGLE_SHEETS_CONFIG, SPREADSHEET_ID, SHEET_NAMES, COLUMN_CONFIG } from '../config/googleSheets.js'

class GoogleSheetsService {
  constructor() {
    // Configuración más compatible con el navegador
    this.auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SHEETS_CONFIG,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    
    this.sheets = google.sheets({ 
      version: 'v4', 
      auth: this.auth,
      // Configuración adicional para el navegador
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  // Obtener todas las organizaciones desde Google Sheets
  async getAllOrganizations() {
    try {
      console.log('Intentando obtener organizaciones desde Google Sheets...')
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A2:N`, // Desde la fila 2 (después de los encabezados)
      })

      const rows = response.data.values || []
      console.log('Filas obtenidas de Google Sheets:', rows)
      
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
      throw new Error(`No se pudieron obtener las organizaciones desde Google Sheets: ${error.message}`)
    }
  }

  // Añadir una nueva organización a Google Sheets
  async addOrganization(organization) {
    try {
      console.log('Intentando añadir organización a Google Sheets:', organization)
      
      const values = [
        [
          organization.id,
          organization.name,
          organization.type,
          organization.description || '',
          organization.address,
          organization.phone || '',
          organization.website || '',
          organization.email || '',
          organization.coordinates ? organization.coordinates[0] : '',
          organization.coordinates ? organization.coordinates[1] : '',
          organization.country,
          organization.city,
          organization.beds || '',
          organization.specialties ? organization.specialties.join(', ') : ''
        ]
      ]

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      })

      console.log('Organización añadida exitosamente:', response.data)
      return true
    } catch (error) {
      console.error('Error al añadir organización:', error)
      throw new Error(`No se pudo añadir la organización a Google Sheets: ${error.message}`)
    }
  }

  // Actualizar una organización existente en Google Sheets
  async updateOrganization(organization) {
    try {
      console.log('Intentando actualizar organización en Google Sheets:', organization)
      
      // Buscar la fila de la organización por ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A:A`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => parseInt(row[0]) === organization.id)
      
      if (rowIndex === -1) {
        throw new Error('Organización no encontrada')
      }

      const values = [
        [
          organization.id,
          organization.name,
          organization.type,
          organization.description || '',
          organization.address,
          organization.phone || '',
          organization.website || '',
          organization.email || '',
          organization.coordinates ? organization.coordinates[0] : '',
          organization.coordinates ? organization.coordinates[1] : '',
          organization.country,
          organization.city,
          organization.beds || '',
          organization.specialties ? organization.specialties.join(', ') : ''
        ]
      ]

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A${rowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: { values }
      })

      console.log('Organización actualizada exitosamente')
      return true
    } catch (error) {
      console.error('Error al actualizar organización:', error)
      throw new Error(`No se pudo actualizar la organización en Google Sheets: ${error.message}`)
    }
  }

  // Eliminar una organización de Google Sheets
  async deleteOrganization(organizationId) {
    try {
      console.log('Intentando eliminar organización de Google Sheets:', organizationId)
      
      // Buscar la fila de la organización por ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A:A`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => parseInt(row[0]) === organizationId)
      
      if (rowIndex === -1) {
        throw new Error('Organización no encontrada')
      }

      // Eliminar la fila
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: await this.getSheetId(SHEET_NAMES.ORGANIZATIONS),
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }
          ]
        }
      })

      console.log('Organización eliminada exitosamente')
      return true
    } catch (error) {
      console.error('Error al eliminar organización:', error)
      throw new Error(`No se pudo eliminar la organización de Google Sheets: ${error.message}`)
    }
  }

  // Obtener el ID de una hoja por nombre
  async getSheetId(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      })

      const sheet = response.data.sheets.find(s => s.properties.title === sheetName)
      return sheet ? sheet.properties.sheetId : null
    } catch (error) {
      console.error('Error al obtener ID de hoja:', error)
      return null
    }
  }

  // Crear encabezados en la hoja si no existen
  async createHeaders() {
    try {
      console.log('Verificando/creando encabezados en Google Sheets...')
      
      const headers = [
        'ID',
        'Nombre',
        'Tipo',
        'Descripción',
        'Dirección',
        'Teléfono',
        'Sitio Web',
        'Email',
        'Latitud',
        'Longitud',
        'País',
        'Ciudad',
        'Camas',
        'Especialidades'
      ]

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A1:N1`
      })

      // Si no hay encabezados, crearlos
      if (!response.data.values || response.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAMES.ORGANIZATIONS}!A1`,
          valueInputOption: 'RAW',
          resource: { values: [headers] }
        })
        console.log('Encabezados creados exitosamente')
      } else {
        console.log('Los encabezados ya existen')
      }
    } catch (error) {
      console.error('Error al crear encabezados:', error)
      throw new Error(`No se pudieron crear los encabezados: ${error.message}`)
    }
  }

  // Sincronizar datos locales con Google Sheets
  async syncWithLocalData(localOrganizations) {
    try {
      console.log('Iniciando sincronización con Google Sheets...')
      
      // Crear encabezados si no existen
      await this.createHeaders()

      // Limpiar datos existentes (excepto encabezados)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORGANIZATIONS}!A2:N`
      })

      // Convertir organizaciones locales al formato de Google Sheets
      const values = localOrganizations.map(org => [
        org.id,
        org.name,
        org.type,
        org.description || '',
        org.address,
        org.phone || '',
        org.website || '',
        org.email || '',
        org.coordinates ? org.coordinates[0] : '',
        org.coordinates ? org.coordinates[1] : '',
        org.country,
        org.city,
        org.beds || '',
        org.specialties ? org.specialties.join(', ') : ''
      ])

      // Añadir todas las organizaciones
      if (values.length > 0) {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAMES.ORGANIZATIONS}!A`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: { values }
        })
      }

      console.log('Sincronización completada exitosamente')
      return true
    } catch (error) {
      console.error('Error en sincronización:', error)
      throw new Error(`No se pudo sincronizar con Google Sheets: ${error.message}`)
    }
  }
}

export default new GoogleSheetsService()

