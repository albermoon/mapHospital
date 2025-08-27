import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import organizationsData from '../data/europeanOrganizations.json'
import AddOrganizationForm from './AddOrganizationForm'
import { createPortal } from 'react-dom'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [organizations, setOrganizations] = useState([])
  const [filteredOrganizations, setFilteredOrganizations] = useState([])
  const [map, setMap] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [locationSelectionCallback, setLocationSelectionCallback] = useState(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)


  // Load organizations data
  useEffect(() => {
    setOrganizations(organizationsData.organizations)
    setFilteredOrganizations(organizationsData.organizations)
  }, [])

  // Function to handle location selection
  const handleLocationSelection = (callback) => {
    if (callback === null) {
      // Exit location selection mode
      setIsSelectingLocation(false)
      setLocationSelectionCallback(null)
    } else {
      // Enter location selection mode
      setIsSelectingLocation(true)
      setLocationSelectionCallback(() => callback)
      // Ensure form stays open when entering location selection mode
      setIsFormOpen(true)
    }
  }

  // Function to add new organization
  const handleAddOrganization = (newOrg) => {
    setOrganizations(prev => [...prev, newOrg])
    setFilteredOrganizations(prev => [...prev, newOrg])
    
    // Add marker to map if it exists
    if (map) {
      const isMobile = window.innerWidth <= 768
      const icon = newOrg.type === 'hospital' ? 
        (isMobile ? hospitalIconMobile : hospitalIcon) : 
        (isMobile ? associationIconMobile : associationIcon)
      
      const popupContent = `
        <div class="organization-popup">
          <h3 style="margin: 0 0 10px 0; color: ${newOrg.type === 'hospital' ? '#dc3545' : '#007bff'}">
            ${newOrg.name}
          </h3>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            <strong>Tipo:</strong> ${newOrg.type === 'hospital' ? '🏥 Hospital' : '👥 Asociación de Pacientes'}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>📍 Dirección:</strong><br>${newOrg.address}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>📞 Teléfono:</strong> ${newOrg.phone}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>🌐 Web:</strong> <a href="${newOrg.website}" target="_blank">${newOrg.website}</a>
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>✉️ Email:</strong> ${newOrg.email}
          </p>

        </div>
      `

      const marker = L.marker(newOrg.coordinates, { icon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 300 })
    }
  }

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && organizations.length > 0) {
      // Initialize the map centered on Europe
      const mapInstance = L.map(mapRef.current).setView([50.8503, 4.3517], 5) // Brussels center

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance)

      // Check if mobile device
      const isMobile = window.innerWidth <= 768
      const hospitalIconToUse = isMobile ? hospitalIconMobile : hospitalIcon
      const associationIconToUse = isMobile ? associationIconMobile : associationIcon

      // Add markers for all organizations
      const markers = []
      organizations.forEach(org => {
        const icon = org.type === 'hospital' ? hospitalIconToUse : associationIconToUse
        
        const popupContent = `
          <div class="organization-popup">
            <h3 style="margin: 0 0 10px 0; color: ${org.type === 'hospital' ? '#dc3545' : '#007bff'}">
              ${org.name}
            </h3>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">
              <strong>Tipo:</strong> ${org.type === 'hospital' ? '🏥 Hospital' : '👥 Asociación de Pacientes'}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>📍 Dirección:</strong><br>${org.address}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>📞 Teléfono:</strong> ${org.phone}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>🌐 Web:</strong> <a href="${org.website}" target="_blank">${org.website}</a>
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>✉️ Email:</strong> ${org.email}
            </p>

          </div>
        `

        const marker = L.marker(org.coordinates, { icon })
          .addTo(mapInstance)
          .bindPopup(popupContent, { maxWidth: 300 })
        
        markers.push(marker)
      })

      // Add search control
      const searchControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control search-control')
          container.innerHTML = `
            <input 
              type="text" 
              placeholder="🔍 Buscar organizaciones..." 
              class="search-input"
            />
          `
          
          const input = container.querySelector('input')
          input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase()
            
            markers.forEach((marker, index) => {
              const org = organizations[index]
              const matchesSearch = org.name.toLowerCase().includes(searchTerm) || 
                                   org.city.toLowerCase().includes(searchTerm) ||
                                   org.country.toLowerCase().includes(searchTerm)
              
              // Check if organization type is currently filtered
              const hospitalFilter = document.querySelector('#hospital-filter')
              const associationFilter = document.querySelector('#association-filter')
              const isTypeVisible = (org.type === 'hospital' && hospitalFilter?.checked) ||
                                   (org.type === 'association' && associationFilter?.checked)
              
              if (matchesSearch && isTypeVisible) {
                marker.addTo(map)
              } else {
                marker.remove()
              }
            })
            
            // If search is empty, show markers based on current filters
            if (searchTerm === '') {
              markers.forEach((marker, index) => {
                const org = organizations[index]
                const hospitalFilter = document.querySelector('#hospital-filter')
                const associationFilter = document.querySelector('#association-filter')
                const isTypeVisible = (org.type === 'hospital' && hospitalFilter?.checked) ||
                                     (org.type === 'association' && associationFilter?.checked)
                
                if (isTypeVisible) {
                  marker.addTo(map)
                }
              })
            }
          })
          
          return container
        }
      })

      mapInstance.addControl(new searchControl())

      // Function to update visible counts
      const updateVisibleCounts = () => {
        const hospitalFilter = document.querySelector('#hospital-filter')
        const associationFilter = document.querySelector('#association-filter')
        
        const visibleHospitals = hospitalFilter?.checked ? 
          organizations.filter(org => org.type === 'hospital').length : 0
        const visibleAssociations = associationFilter?.checked ? 
          organizations.filter(org => org.type === 'association').length : 0
        
        setVisibleCounts({
          hospitals: visibleHospitals,
          associations: visibleAssociations
        })
      }

      // Add filter control
      const filterControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control filter-control')
          
          const hospitals = organizations.filter(org => org.type === 'hospital')
          const associations = organizations.filter(org => org.type === 'association')
          
          container.innerHTML = `
            <div class="filter-panel">
              <div class="filter-item">
                <label class="filter-checkbox">
                  <input type="checkbox" id="hospital-filter" checked>
                  <span class="filter-icon" style="color: #dc3545;">⚕</span>
                  <span class="filter-text">Hospitales (${hospitals.length})</span>
                </label>
              </div>
              <div class="filter-item">
                <label class="filter-checkbox">
                  <input type="checkbox" id="association-filter" checked>
                  <span class="filter-icon" style="color: #007bff;">👥</span>
                  <span class="filter-text">Asociaciones (${associations.length})</span>
                </label>
              </div>

            </div>
          `
          
          // Add event listeners for filters
          const hospitalFilter = container.querySelector('#hospital-filter')
          const associationFilter = container.querySelector('#association-filter')
          
          hospitalFilter.addEventListener('change', (e) => {
            markers.forEach((marker, index) => {
              const org = organizations[index]
              if (org.type === 'hospital') {
                if (e.target.checked) {
                  marker.addTo(map)
                } else {
                  marker.remove()
                }
              }
            })
            updateVisibleCounts()
          })
          
          associationFilter.addEventListener('change', (e) => {
            markers.forEach((marker, index) => {
              const org = organizations[index]
              if (org.type === 'association') {
                if (e.target.checked) {
                  marker.addTo(map)
                } else {
                  marker.remove()
                }
              }
            })
            updateVisibleCounts()
          })
          
          return container
        }
      })

      mapInstance.addControl(new filterControl())

      // Add add organization control
      const addControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control add-control')
          container.innerHTML = `
            <button class="add-btn" title="Añadir nueva organización">
              <span class="add-icon">➕</span>
            </button>
          `
          
          const button = container.querySelector('button')
          button.addEventListener('click', () => {
            setIsFormOpen(true)
          })
          
          return container
        }
      })

      mapInstance.addControl(new addControl())

      // Add click event for location selection
      if (isSelectingLocation) {
        mapInstance.on('click', (e) => {
          const { lat, lng } = e.latlng
          
          // Show temporary marker
          const tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              html: `
                <div style="
                  background: #e74c3c;
                  color: white;
                  border-radius: 50%;
                  width: 25px;
                  height: 25px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  border: 3px solid white;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                  📍
                </div>
              `,
              className: 'temp-location-marker',
              iconSize: [25, 25],
              iconAnchor: [12.5, 12.5]
            })
          }).addTo(mapInstance)

          // Show confirmation popup
          const confirmPopup = L.popup({
            closeButton: false,
            className: 'location-confirmation-popup'
          })
          .setLatLng([lat, lng])
          .setContent(`
            <div style="text-align: center; padding: 15px; min-width: 200px;">
              <h4 style="margin: 0 0 15px 0; color: #2c3e50;">📍 Confirmar Ubicación</h4>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #34495e;">
                <strong>Lat:</strong> ${lat.toFixed(6)}<br>
                <strong>Lng:</strong> ${lng.toFixed(6)}
              </p>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button 
                  id="confirm-location-btn" 
                  style="
                    background: #27ae60; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 14px;
                  "
                >
                  ✅ Confirmar
                </button>
                <button 
                  id="cancel-location-btn" 
                  style="
                    background: #e74c3c; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 14px;
                  "
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          `)
          .openOn(mapInstance)

          // Add event listeners to buttons
          setTimeout(() => {
            const confirmBtn = document.getElementById('confirm-location-btn')
            const cancelBtn = document.getElementById('cancel-location-btn')
            
                      if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
              // Save coordinates and exit selection mode
              setSelectedCoordinates([lat, lng])
              setIsSelectingLocation(false)
              
              // Call the callback with the selected coordinates
              if (locationSelectionCallback) {
                locationSelectionCallback([lat, lng])
                setLocationSelectionCallback(null)
              }
              
              // Ensure form stays open after location selection
              setIsFormOpen(true)
              
              // Close popup and remove marker
              mapInstance.closePopup(confirmPopup)
              mapInstance.removeLayer(tempMarker)
            })
          }
            
            if (cancelBtn) {
              cancelBtn.addEventListener('click', () => {
                // Close popup and remove marker
                mapInstance.closePopup(confirmPopup)
                mapInstance.removeLayer(tempMarker)
              })
            }
          }, 100)
        })
      }

      // Add fullscreen control
      const fullscreenControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control fullscreen-control')
          container.innerHTML = `
            <button class="fullscreen-btn" title="Pantalla completa">
              <span class="fullscreen-icon">⛶</span>
            </button>
          `
          
          const button = container.querySelector('button')
          button.addEventListener('click', () => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen()
            } else {
              document.exitFullscreen()
            }
          })
          
          return container
        }
      })

      mapInstance.addControl(new fullscreenControl())

      setMap(mapInstance)
      mapInstanceRef.current = mapInstance
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [organizations])

  // Handle location selection mode changes
  useEffect(() => {
    if (mapInstanceRef.current && isSelectingLocation) {
      // Enable click events for location selection
      const map = mapInstanceRef.current
      
      const handleMapClick = (e) => {
        const { lat, lng } = e.latlng
        
        // Show temporary marker
        const tempMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `
              <div style="
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              ">
                📍
              </div>
            `,
            className: 'temp-location-marker',
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          })
        }).addTo(map)

        // Show confirmation popup
        const confirmPopup = L.popup({
          closeButton: false,
          className: 'location-confirmation-popup'
        })
        .setLatLng([lat, lng])
        .setContent(`
          <div style="text-align: center; padding: 15px; min-width: 200px;">
            <h4 style="margin: 0 0 15px 0; color: #2c3e50;">📍 Confirmar Ubicación</h4>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #34495e;">
              <strong>Lat:</strong> ${lat.toFixed(6)}<br>
              <strong>Lng:</strong> ${lng.toFixed(6)}
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button 
                id="confirm-location-btn" 
                style="
                  background: #27ae60; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 14px;
                "
              >
                ✅ Confirmar
              </button>
              <button 
                id="cancel-location-btn" 
                style="
                  background: #e74c3c; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 14px;
                "
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        `)
        .openOn(map)

        // Add event listeners to buttons
        setTimeout(() => {
          const confirmBtn = document.getElementById('confirm-location-btn')
          const cancelBtn = document.getElementById('cancel-location-btn')
          
          if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
              // Save coordinates and exit selection mode
              setSelectedCoordinates([lat, lng])
              setIsSelectingLocation(false)
              
              // Call the callback with the selected coordinates
              if (locationSelectionCallback) {
                locationSelectionCallback([lat, lng])
                setLocationSelectionCallback(null)
              }
              
              // Ensure form stays open after location selection
              setIsFormOpen(true)
              
              // Close popup and remove marker
              map.closePopup(confirmPopup)
              map.removeLayer(tempMarker)
            })
          }
          
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
              // Close popup and remove marker
              map.closePopup(confirmPopup)
              map.removeLayer(tempMarker)
            })
          }
        }, 100)
      }

      map.on('click', handleMapClick)

      return () => {
        map.off('click', handleMapClick)
      }
    }
  }, [isSelectingLocation, locationSelectionCallback])

  return (
    <div className="map-container">
      <div ref={mapRef} className="map-viewport"></div>
      
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
