import React, { useState, useEffect } from 'react'
import './AddOrganizationForm.css'
import MapSelector from './MapSelector'

const AddOrganizationForm = ({ isOpen, onClose, onAdd, organizations, onStartLocationSelection, selectedCoordinates, isLocationSelectionMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    address: '',
    phone: '',
    website: '',
    email: '',
    country: '',
    city: '',
    specialty: '',
    coordinates: null
  })

  const [errors, setErrors] = useState({})
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [formDataBackup, setFormDataBackup] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria'
    if (!formData.country.trim()) newErrors.country = 'El país es obligatorio'
    if (!formData.city.trim()) newErrors.city = 'La ciudad es obligatoria'
    if (!formData.coordinates) newErrors.coordinates = 'Debe seleccionar una ubicación en el mapa'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const newOrganization = {
      id: organizations.length + 1,
      name: formData.name.trim(),
      type: formData.type,
      address: formData.address.trim(),
      phone: formData.phone.trim() || null,
      website: formData.website.trim() || null,
      email: formData.email.trim() || null,
      coordinates: formData.coordinates,
      country: formData.country.trim(),
      city: formData.city.trim(),
      specialty: formData.specialty.trim() || null
    }

    onAdd(newOrganization)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'hospital',
      address: '',
      phone: '',
      website: '',
      email: '',
      country: '',
      city: '',
      specialty: '',
      coordinates: null
    })
    setErrors({})
    onClose()
  }

  const handleLocationSelect = (coordinates) => {
    console.log('Location selected. Updating form data with coordinates:', coordinates)
    console.log('Previous form data:', formData)
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        coordinates
      }
      console.log('Updated form data:', updatedData)
      return updatedData
    })
    
    // Exit location selection mode and return to form
    setIsSelectingLocation(false)
    // Notify parent to exit location selection mode
    if (onStartLocationSelection) {
      onStartLocationSelection(null)
    }
  }

  const handleStartLocationSelection = () => {
    // Store current form data before entering location selection mode
    console.log('Entering location selection mode. Current form data:', formData)
    
    // Backup current form data to ensure it's not lost
    setFormDataBackup(formData)
    
    setIsSelectingLocation(true)
    if (onStartLocationSelection) {
      onStartLocationSelection(handleLocationSelect)
    }
  }

  const handleCancelLocationSelection = () => {
    // Exit location selection mode and return to form with all data preserved
    console.log('Canceling location selection. Restoring form data from backup:', formDataBackup)
    
    // Restore form data from backup if available
    if (formDataBackup) {
      setFormData(formDataBackup)
    }
    
    setIsSelectingLocation(false)
    if (onStartLocationSelection) {
      onStartLocationSelection(null)
    }
  }

  // Update form data when coordinates are selected
  useEffect(() => {
    if (selectedCoordinates) {
      console.log('Selected coordinates received from parent:', selectedCoordinates)
      console.log('Current form data before update:', formData)
      
      setFormData(prev => {
        const updatedData = {
          ...prev,
          coordinates: selectedCoordinates
        }
        console.log('Form data updated with coordinates:', updatedData)
        return updatedData
      })
      
      // Exit location selection mode when coordinates are received
      setIsSelectingLocation(false)
      // Also notify parent to exit location selection mode
      if (onStartLocationSelection) {
        onStartLocationSelection(null)
      }
    }
  }, [selectedCoordinates, onStartLocationSelection])

  if (!isOpen) return null

  // Debug log to show current form data
  console.log('Form rendering with data:', formData, 'Location mode:', isLocationSelectionMode)

  return (
    <div className="form-overlay" onClick={handleClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>
            {isLocationSelectionMode ? '📍 Seleccionar Ubicación en el Mapa' : '➕ Añadir Nueva Organización'}
          </h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          {/* Location selection instructions - shown when in location selection mode */}
          {isLocationSelectionMode && (
            <div className="location-selection-banner">
              <div className="location-instructions">
                <p>🗺️ <strong>Modo de Selección de Ubicación</strong></p>
                <p>Haga clic en el mapa principal para seleccionar la ubicación. Los datos del formulario se mantendrán.</p>
              </div>
              <button 
                type="button" 
                className="btn-secondary location-cancel-btn" 
                onClick={handleCancelLocationSelection}
              >
                ← Cancelar Selección de Ubicación
              </button>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Tipo de Organización *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'error' : ''}
                disabled={isLocationSelectionMode}
              >
                <option value="hospital">🏥 Hospital</option>
                <option value="association">👥 Asociación de Pacientes</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre de la organización"
                className={errors.name ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Dirección *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Dirección completa"
                className={errors.address ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">País *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="País"
                className={errors.country ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Ciudad"
                className={errors.city ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialty">Especialidad</label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                placeholder="Especialidad de la organización"
                className={errors.specialty ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.specialty && <span className="error-message">{errors.specialty}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ubicación en el Mapa *</label>
              <div className="map-selector">
                <div className="map-placeholder" onClick={handleStartLocationSelection}>
                  {formData.coordinates ? (
                    <div className="coordinates-display">
                      <span>📍 Ubicación seleccionada:</span>
                      <strong>Lat: {formData.coordinates[0].toFixed(6)}, Lng: {formData.coordinates[1].toFixed(6)}</strong>
                      <button 
                        type="button" 
                        className="change-location-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData(prev => ({ ...prev, coordinates: null }))
                        }}
                      >
                        Cambiar ubicación
                      </button>
                    </div>
                  ) : (
                    <div className="map-instructions">
                      <span>🗺️ Haga clic en el mapa para seleccionar la ubicación</span>
                      <small>El mapa se abrirá al hacer clic aquí</small>
                    </div>
                  )}
                </div>
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+34 91 123 45 67"
                className={errors.phone ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@organizacion.com"
                className={errors.email ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="website">Página Web</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.organizacion.com"
                className={errors.website ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.website && <span className="error-message">{errors.website}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLocationSelectionMode}>
              ➕ Añadir Organización
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrganizationForm
