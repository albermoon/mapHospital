import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import AddOrganizationForm from './AddOrganizationForm'
import { filterOrganizationsByType } from '../utils/filter'
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
  const filterControlRef = useRef(null)

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
    const filtered = filterOrganizationsByType(organizations, showHospitals, showAssociations)
    setFilteredOrganizations(filtered)
  }, [organizations, showHospitals, showAssociations])

  // Memoize filter counts to prevent unnecessary recalculations
  const filterCounts = useMemo(() => {
    const hospitalCount = organizations.filter(org => org.type === 'hospital').length;
    const associationCount = organizations.filter(org => org.type === 'association').length;
    return { hospitalCount, associationCount };
  }, [organizations]);

  // Update filter counts when data changes (removed infinite loop)
  useEffect(() => {
    if (filterControlRef.current) {
      updateFilterCounts();
    }
  }, [filterCounts, t]); // Only depend on memoized counts, not filteredOrganizations

  // Function to update filter counts
  const updateFilterCounts = useCallback(() => {
    // Use memoized counts instead of recalculating
    const { hospitalCount, associationCount } = filterCounts;

    // Update the DOM elements directly
    const hospitalFilter = document.getElementById('hospital-filter');
    const associationFilter = document.getElementById('association-filter');

    if (hospitalFilter) {
      const textElement = hospitalFilter.parentElement.querySelector('.filter-text');
      if (textElement) {
        textElement.textContent = `${t('hospitals')} (${hospitalCount})`;
      }
    }

    if (associationFilter) {
      const textElement = associationFilter.parentElement.querySelector('.filter-text');
      if (textElement) {
        textElement.textContent = `${t('associations')} (${associationCount})`;
      }
    }
  }, [filterCounts, t]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []
  }, [])

  // Memoize popup content generation to avoid recreating on every render
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
        ${org.specialty ? `
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>🏷️ ${t('specialty')}:</strong> ${org.specialty}
          </p>
        ` : ''}
      </div>
    `
  }, [t])

  // Update markers on the map with performance optimizations
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return

    // Start timing the marker rendering process
    const renderStartTime = performance.now()
    console.log(`🎨 Starting marker rendering for ${filteredOrganizations.length} organizations`)

    // Clear existing markers
    clearMarkers()

    // Early return if no organizations
    if (filteredOrganizations.length === 0) {
      console.log(`⏱️ No markers to render`)
      return
    }

    const isMobile = window.innerWidth <= 768
    const hospitalIconToUse = isMobile ? hospitalIconMobile : hospitalIcon
    const associationIconToUse = isMobile ? associationIconMobile : associationIcon

    // Batch marker creation for better performance
    const markersToAdd = []

    filteredOrganizations.forEach((org, index) => {
      if (!org.coordinates || org.coordinates.length !== 2) {
        console.warn('Invalid coordinates for org:', org)
        return
      }

      const icon = org.type === 'hospital' ? hospitalIconToUse : associationIconToUse
      const popupContent = generatePopupContent(org)

      const marker = L.marker(org.coordinates, { icon })
        .bindPopup(popupContent, { maxWidth: 300 })

      markersToAdd.push(marker)

      // Log progress for large datasets
      if (filteredOrganizations.length > 100 && index % 50 === 0) {
        console.log(`🎨 Prepared ${index + 1}/${filteredOrganizations.length} markers`)
      }
    })

    // Add all markers to the map at once
    markersToAdd.forEach(marker => {
      marker.addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    })

    // End timing the marker rendering process
    const renderEndTime = performance.now()
    const renderDuration = renderEndTime - renderStartTime
    console.log(`⏱️ Marker rendering completed in ${renderDuration.toFixed(2)}ms`)
    console.log(`🎨 Rendered ${markersRef.current.length} markers on the map`)
  }, [filteredOrganizations, clearMarkers, generatePopupContent])

  // Debounced marker update to prevent excessive re-renders
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMarkers()
    }, 100) // 100ms debounce

    return () => clearTimeout(timeoutId)
  }, [updateMarkers])

  // Handle map clicks when in location selection mode
  useEffect(() => {
    if (!map || !isSelectingLocation) return

    const handleMapClick = (e) => {
      if (isSelectingLocation && locationSelectionCallback) {
        const { lat, lng } = e.latlng

        // Add a marker at the clicked location for visual feedback
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        markerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="background:#e74c3c;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍</div>`,
            className: 'location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map)

        // Show coordinates in a popup
        const popup = markerRef.current.bindPopup(`
          <div style="text-align:center;padding:10px;">
            <strong>✅ ${t('locationSelected')}</strong><br>
            Lat: ${lat.toFixed(6)}<br>
            Lng: ${lng.toFixed(6)}
          </div>
        `).openPopup()

        // Auto-close the popup after 1.5 seconds and send coordinates
        setTimeout(() => {
          if (popup && popup.closePopup) {
            popup.closePopup()
          }
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
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
    }
  }, [map, isSelectingLocation, locationSelectionCallback, t])

  // Handle location selection
  const handleLocationSelection = useCallback((callback) => {
    if (callback === null) {
      setIsSelectingLocation(false)
      setLocationSelectionCallback(null)
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }
    } else {
      setIsFormOpen(false)
      setIsSelectingLocation(true)
      setLocationSelectionCallback(() => callback)
    }
  }, [])

  // Handle adding a new organization
  const handleAddOrganization = (newOrg) => {
    if (onAddOrganization) {
      onAddOrganization(newOrg)
    } else {
      setOrganizations(prev => [...prev, newOrg])
      setFilteredOrganizations(prev => [...prev, newOrg])
    }
  }

  // Handle search organization selection
  const handleSelectOrganization = useCallback((organization) => {
    if (mapInstanceRef.current && organization.coordinates) {
      // Zoom to the selected organization
      mapInstanceRef.current.setView(organization.coordinates, 15)

      // Find and open the popup for this organization
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
      const mapInstance = L.map(mapRef.current, { zoomControl: false })
        .setView([50.8503, 4.3517], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance)

      // Add custom controls
      addFilterControl(mapInstance)
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

  // Filter control
  const addFilterControl = (mapInstance) => {
    const FilterControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'filter-control')

        // Use memoized counts instead of recalculating
        const { hospitalCount, associationCount } = filterCounts

        container.innerHTML = `
          <div class="filter-panel" id="filter-panel">
            <button class="filter-toggle" id="filter-toggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 14.414V19a1 1 0 01-.553.894l-2 1A1 1 0 019 20v-5.586L1.293 6.707A1 1 0 011 6V4z" fill="currentColor"/>
              </svg>
            </button>
            <div class="filter-item">
              <label class="filter-checkbox">
                <input type="checkbox" id="hospital-filter" ${showHospitals ? 'checked' : ''}>
                <span class="filter-icon" style="color: #dc3545;">⚕</span>
                <span class="filter-text">${t('hospitals')} (${hospitalCount})</span>
              </label>
            </div>
            <div class="filter-item">
              <label class="filter-checkbox">
                <input type="checkbox" id="association-filter" ${showAssociations ? 'checked' : ''}>
                <span class="filter-icon" style="color: #007bff;">👥</span>
                <span class="filter-text">${t('associations')} (${associationCount})</span>
              </label>
            </div>
          </div>
        `

        const hospitalFilter = container.querySelector('#hospital-filter')
        const associationFilter = container.querySelector('#association-filter')
        const filterPanel = container.querySelector('#filter-panel')
        const filterToggle = container.querySelector('#filter-toggle')

        // Handle mobile toggle
        filterToggle.addEventListener('click', () => {
          if (filterPanel.classList.contains('expanded')) {
            filterPanel.classList.remove('expanded');
          } else {
            filterPanel.classList.add('expanded');
          }
        });

        hospitalFilter.addEventListener('change', (e) => {
          setShowHospitals(e.target.checked)
        })

        associationFilter.addEventListener('change', (e) => {
          setShowAssociations(e.target.checked)
        })

        filterControlRef.current = container;
        return container
      }
    })

    mapInstance.addControl(new FilterControl())
  }

  // Add control
  const addAddControl = (mapInstance) => {
    const AddControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'add-control')

        container.innerHTML = `
          <button class="add-btn" title="${t('addOrganization')}">
            <span class="add-icon">+</span>
          </button>
        `

        const addButton = container.querySelector('.add-btn')
        addButton.addEventListener('click', () => {
          setIsFormOpen(true)
        })

        return container
      }
    })

    mapInstance.addControl(new AddControl())
  }

  // Geolocation control
  const addGeolocationControl = (mapInstance) => {
    const GeolocationControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'geolocation-control')

        container.innerHTML = `
          <button class="geolocation-btn" title="${t('findMyLocation')}">
            <span class="geolocation-icon">📍</span>
          </button>
        `

        const geoButton = container.querySelector('.geolocation-btn')
        geoButton.addEventListener('click', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                mapInstance.setView([latitude, longitude], 13)
              },
              (error) => {
                console.error('Geolocation error:', error)
                alert(t('geolocationError'))
              }
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
      <div
        ref={mapRef}
        className={`map-viewport ${isSelectingLocation ? 'location-selection-mode' : ''}`}
      />

      {/* Search Control */}
      <SearchControl
        organizations={organizations}
        onSelectOrganization={handleSelectOrganization}
      />

      {/* Location Selection Overlay */}
      {isSelectingLocation && (
        <div className="location-selection-overlay">
          <div className="location-selection-banner">
            <div className="location-instructions">
              <p><strong>{t('locationSelectionMode')}</strong></p>
              <p>{t('locationSelectionDescription')}</p>
              <p><small>{t('clickMapToSelect')}</small></p>
            </div>
            <button
              type="button"
              className="location-cancel-btn"
              onClick={() => handleLocationSelection(null)}
            >
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