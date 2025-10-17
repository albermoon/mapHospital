import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import AddOrganizationForm from './AddOrganizationForm'
import SearchControl from './SearchControl'
import { useTranslation } from '../utils/i18n'

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = ({ organizations: propOrganizations = [], onAddOrganization }) => {
  const { t } = useTranslation()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const markersRef = useRef([])
  const tempLocationMarkerRef = useRef(null)

  const [organizations, setOrganizations] = useState([])
  const [filteredOrganizations, setFilteredOrganizations] = useState([])
  const [map, setMap] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [locationSelectionCallback, setLocationSelectionCallback] = useState(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)
  const [showHospitals, setShowHospitals] = useState(true)
  const [showAssociations, setShowAssociations] = useState(true)
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(false)

  // Initialize organizations from props
  useEffect(() => {
    if (propOrganizations && propOrganizations.length > 0) {
      setOrganizations(propOrganizations)
      setFilteredOrganizations(propOrganizations)
    } else {
      setOrganizations([])
      setFilteredOrganizations([])
    }
  }, [propOrganizations])



  // Filter organizations based on toggle states
  useEffect(() => {
    const filtered = organizations.filter(org => {
      if (!showHospitals && !showAssociations) return false
      if (org.type === 'hospital' && showHospitals) return true
      if (org.type === 'association' && showAssociations) return true
      return false
    })
    setFilteredOrganizations(filtered)
  }, [organizations, showHospitals, showAssociations])


  // Memoize filter counts
  const filterCounts = useMemo(() => {
    const hospitalCount = organizations.filter(org => org.type === 'hospital').length;
    const associationCount = organizations.filter(org => org.type === 'association').length;
    return { hospitalCount, associationCount };
  }, [organizations]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []
  }, [])

  // Memoize popup content
  const generatePopupContent = useCallback((org) => {
    const typeColor = org.type === 'hospital' ? '#dc3545' : '#007bff'
    const typeLabel = org.type === 'hospital' ? t('hospital') : t('association')

    return `
      <div class="organization-popup">
        <h3 style="margin: 0 0 10px 0; color: ${typeColor}">
          ${org.name}
        </h3>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
          <strong>${t('type')}:</strong> ${org.type === 'hospital' ? '🏥' : '👥'} ${typeLabel}
        </p>
        <p style="margin: 5px 0; font-size: 12px;">
          <strong>📍 ${t('address')}:</strong>
          <a class="address-link" data-lat="${org.coordinates[0]}" data-lng="${org.coordinates[1]}" 
             style="text-decoration:">
            ${org.address}
          </a>
        </p>
        ${org.phone ? `
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>📞 ${t('phone')}:</strong> ${org.phone}
          </p>
        ` : ''}
        ${org.website ? `
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>🌐 ${t('website')}:</strong> 
            <a href="${org.website}" target="_blank" rel="noopener noreferrer">${org.website}</a>
          </p>
        ` : ''}
        ${org.email ? `
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>✉️ ${t('email')}:</strong> ${org.email}
          </p>
        ` : ''}
        ${org.speciality ? `
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>🏷️ ${t('speciality')}:</strong> ${org.speciality}
          </p>
        ` : ''}
      </div>
    `
  }, [t])

  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return

    clearMarkers()

    if (!filteredOrganizations || filteredOrganizations.length === 0) return

    const isMobile = window.innerWidth <= 768
    const hospitalIconToUse = isMobile ? hospitalIconMobile : hospitalIcon
    const associationIconToUse = isMobile ? associationIconMobile : associationIcon

    filteredOrganizations.forEach((org) => {
      if (!org.coordinates || org.coordinates.length !== 2) return

      const icon = org.type === 'hospital' ? hospitalIconToUse : associationIconToUse
      const popupContent = generatePopupContent(org)

      const marker = L.marker(org.coordinates, { icon })
        .bindPopup(popupContent, { maxWidth: 300 })

      marker.addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    })
  }, [filteredOrganizations, clearMarkers, generatePopupContent])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMarkers()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [updateMarkers])

  // Location selection
  useEffect(() => {
    if (!map || !isSelectingLocation) return

    const handleMapClick = (e) => {
      if (locationSelectionCallback) {
        const { lat, lng } = e.latlng

        if (markerRef.current) map.removeLayer(markerRef.current)

        markerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="background:#e74c3c;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍</div>`,
            className: 'location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map)

        const popup = markerRef.current.bindPopup(`
          <div style="text-align:center;padding:10px;">
            <strong>✅ ${t('locationSelected')}</strong><br>
            Lat: ${lat.toFixed(6)}<br>
            Lng: ${lng.toFixed(6)}
          </div>
        `).openPopup()

        setTimeout(() => {
          if (popup && popup.closePopup) popup.closePopup()
          locationSelectionCallback([lat, lng])
          setIsSelectingLocation(false)
          setLocationSelectionCallback(null)
          setIsFormOpen(true)
        }, 1500)
      }
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
      if (markerRef.current) map.removeLayer(markerRef.current)
    }
  }, [map, isSelectingLocation, locationSelectionCallback, t])

  const handleLocationSelection = useCallback((callback) => {
    if (!callback) {
      setIsSelectingLocation(false)
      setLocationSelectionCallback(null)
      if (markerRef.current && mapInstanceRef.current) mapInstanceRef.current.removeLayer(markerRef.current)
    } else {
      setIsFormOpen(false)
      setIsSelectingLocation(true)
      setLocationSelectionCallback(() => callback)
    }
  }, [])

  const handleAddOrganization = (newOrg) => {
    if (onAddOrganization) onAddOrganization(newOrg)
    else {
      setOrganizations(prev => [...prev, newOrg])
      setFilteredOrganizations(prev => [...prev, newOrg])
    }
  }

  const handleSelectOrganization = useCallback((organization) => {
    if (mapInstanceRef.current && organization.coordinates) {
      mapInstanceRef.current.setView(organization.coordinates, 15)
      markersRef.current.forEach(marker => {
        const markerLatLng = marker.getLatLng()
        if (markerLatLng.lat === organization.coordinates[0] &&
          markerLatLng.lng === organization.coordinates[1]) {
          marker.openPopup()
        }
      })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([50.8503, 4.3517], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance)

      addAddControl(mapInstance)
      addGeolocationControl(mapInstance)

      mapInstanceRef.current = mapInstance
      setMap(mapInstance)
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add control functions
  const addAddControl = (mapInstance) => {
    const AddControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'add-control')
        container.innerHTML = `<button class="add-btn" title="${t('addOrganization')}"><span class="add-icon">+</span></button>`
        const addButton = container.querySelector('.add-btn')
        addButton.addEventListener('click', () => setIsFormOpen(true))
        return container
      }
    })
    mapInstance.addControl(new AddControl())
  }

  const addGeolocationControl = (mapInstance) => {
    const GeolocationControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'geolocation-control')
        container.innerHTML = `<button class="geolocation-btn" title="${t('findMyLocation')}"><span class="geolocation-icon">📍</span></button>`

        const button = container.querySelector('.geolocation-btn')
        button.addEventListener('click', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords
                mapInstance.setView([latitude, longitude], 13)

                if (tempLocationMarkerRef.current) {
                  mapInstance.removeLayer(tempLocationMarkerRef.current)
                }

                // Add new temporary marker using default Leaflet icon
                tempLocationMarkerRef.current = L.marker([latitude, longitude], {
                  icon: new L.Icon.Default(),
                }).addTo(mapInstance)

              },
              (err) => { console.error(err); alert(t('geolocationError')) }
            )
          } else {
            alert(t('geolocationNotSupported'))
          }
        })

        return container
      }
    })

    mapInstance.addControl(new GeolocationControl())
  }


  return (
    <div className="map-container">
      <div ref={mapRef} className={`map-viewport ${isSelectingLocation ? 'location-selection-mode' : ''}`} />

      {/* React-controlled Filter Panel */}
      <div className="filter-control">
        <div className={`filter-panel ${filterPanelExpanded ? 'expanded' : ''}`}>
          <button className="filter-toggle" onClick={() => setFilterPanelExpanded(prev => !prev)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 14.414V19a1 1 0 01-.553.894l-2 1A1 1 0 019 20v-5.586L1.293 6.707A1 1 0 011 6V4z" fill="currentColor" />
            </svg>
          </button>

          <div className="filter-item">
            <label className="filter-checkbox">
              <input type="checkbox" checked={showHospitals} onChange={e => setShowHospitals(e.target.checked)} />
              <span className="filter-icon" style={{ color: '#dc3545' }}>⚕</span>
              <span className="filter-text">{t('hospitals')} ({filterCounts.hospitalCount})</span>
            </label>
          </div>

          <div className="filter-item">
            <label className="filter-checkbox">
              <input type="checkbox" checked={showAssociations} onChange={e => setShowAssociations(e.target.checked)} />
              <span className="filter-icon" style={{ color: '#007bff' }}>👥</span>
              <span className="filter-text">{t('associations')} ({filterCounts.associationCount})</span>
            </label>
          </div>
        </div>
      </div>

      {/* Search Control */}
      <SearchControl organizations={organizations} onSelectOrganization={handleSelectOrganization} />

      {/* Location Selection Overlay */}
      {isSelectingLocation && (
        <div className="location-selection-overlay">
          <div className="location-selection-banner">
            <div className="location-instructions">
              <p><strong>{t('locationSelectionMode')}</strong></p>
              <p>{t('locationSelectionDescription')}</p>
              <p><small>{t('clickMapToSelect')}</small></p>
            </div>
            <button type="button" className="location-cancel-btn" onClick={() => handleLocationSelection(null)}>
              ← {t('cancel')} {t('selectLocation')}
            </button>
          </div>
        </div>
      )}

      {/* Add Organization Form */}
      <AddOrganizationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdd={handleAddOrganization}
        organizations={organizations}
        onStartLocationSelection={handleLocationSelection}
        selectedCoordinates={selectedCoordinates}
        isLocationSelectionMode={isSelectingLocation}
      />
    </div>
  )
}

export default MapComponent
