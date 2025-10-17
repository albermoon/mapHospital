import React, { useState, useEffect } from 'react'
import './AddOrganizationForm.css'
import { useTranslation } from '../utils/i18n'

const AddOrganizationForm = ({
  isOpen,
  onClose,
  onAdd,
  organizations,
  onStartLocationSelection,
  selectedCoordinates,
  isLocationSelectionMode
}) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    address: '',
    phone: '',
    website: '',
    email: '',
    country: '',
    city: '',
    speciality: '',
    coordinates: null
  })

  const [errors, setErrors] = useState({})
  const [formDataBackup, setFormDataBackup] = useState(null)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = t('requiredField')
    if (!formData.address.trim()) newErrors.address = t('requiredField')
    if (!formData.country.trim()) newErrors.country = t('requiredField')
    if (!formData.city.trim()) newErrors.city = t('requiredField')
    if (!formData.coordinates) newErrors.coordinates = t('mustSelectLocation')

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = t('invalidEmail')
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = t('invalidWebsite')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
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
      speciality: formData.speciality.trim() || null
    }

    onAdd(newOrganization)
    handleClose()
  }

  // Close form and reset
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
      speciality: '',
      coordinates: null
    })
    setErrors({})
    onClose()
  }

  // Start location selection
  const handleStartLocationSelection = () => {
    setFormDataBackup(formData)

    if (onStartLocationSelection) {
      onStartLocationSelection(handleLocationSelect)
    }
  }

  // Handle location selection callback
  const handleLocationSelect = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates
    }))

    if (onStartLocationSelection) {
      onStartLocationSelection(null)
    }
  }

  // Cancel location selection
  const handleCancelLocationSelection = () => {
    if (formDataBackup) {
      setFormData(formDataBackup)
    }

    if (onStartLocationSelection) {
      onStartLocationSelection(null)
    }
  }

  // Update coordinates when received from parent
  useEffect(() => {
    if (selectedCoordinates) {
      setFormData(prev => ({
        ...prev,
        coordinates: selectedCoordinates
      }))

      if (onStartLocationSelection) {
        onStartLocationSelection(null)
      }
    }
  }, [selectedCoordinates, onStartLocationSelection])

  if (!isOpen) return null

  return (
    <div className="form-overlay" onClick={handleClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>
            {isLocationSelectionMode ? `📍 ${t('selectLocation')}` : `➕ ${t('addOrganization')}`}
          </h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          {/* Location selection banner */}
          {isLocationSelectionMode && (
            <div className="location-selection-banner">
              <div className="location-instructions">
                <p><strong>{t('locationSelectionMode')}</strong></p>
                <p>{t('locationSelectionDescription')}</p>
                <p><small>{t('clickMapToSelect')}</small></p>
              </div>
              <button
                type="button"
                className="btn-secondary location-cancel-btn"
                onClick={handleCancelLocationSelection}
              >
                ← {t('cancel')} {t('selectLocation')}
              </button>
            </div>
          )}

          {/* Organization Type */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">{t('selectOrganizationType')} *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'error' : ''}
                disabled={isLocationSelectionMode}
              >
                <option value="hospital">🏥 {t('hospital')}</option>
                <option value="association">👥 {t('association')}</option>
              </select>
            </div>
          </div>

          {/* Organization Name */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('organizationName')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('organizationName')}
                className={errors.name ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          {/* Address */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">{t('address')} *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={t('fullAddress')}
                className={errors.address ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </div>

          {/* Country and City */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">{t('country')} *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder={t('country')}
                className={errors.country ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="city">{t('city')} *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder={t('city')}
                className={errors.city ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </div>

          {/* Speciality */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="speciality">{t('speciality')}</label>
              <input
                type="text"
                id="speciality"
                name="speciality"
                value={formData.speciality}
                onChange={handleInputChange}
                placeholder={t('organizationSpeciality')}
                disabled={isLocationSelectionMode}
              />
            </div>
          </div>

          {/* Location Selector */}
          <div className="form-row">
            <div className="form-group">
              <label>{t('selectLocation')} *</label>
              <div className="map-selector">
                <div className="map-placeholder" onClick={handleStartLocationSelection}>
                  {formData.coordinates ? (
                    <div className="coordinates-display">
                      <span>📍 {t('locationSelected')}:</span>
                      <strong>
                        Lat: {formData.coordinates[0].toFixed(6)},
                        Lng: {formData.coordinates[1].toFixed(6)}
                      </strong>
                      <button
                        type="button"
                        className="change-location-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData(prev => ({ ...prev, coordinates: null }))
                        }}
                      >
                        {t('changeLocation')}
                      </button>
                    </div>
                  ) : (
                    <div className="map-instructions">
                      <span>🗺️ {t('clickToSelectLocation')}</span>
                      <small>{t('mapWillOpen')}</small>
                    </div>
                  )}
                </div>
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('phone')}
                disabled={isLocationSelectionMode}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('email')}
                className={errors.email ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {/* Website */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="website">{t('website')}</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder={t('website')}
                className={errors.website ? 'error' : ''}
                disabled={isLocationSelectionMode}
              />
              {errors.website && <span className="error-message">{errors.website}</span>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={isLocationSelectionMode}>
              ➕ {t('addOrganization')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrganizationForm