import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import AddOrganizationForm from './AddOrganizationForm'
import { createPortal } from 'react-dom'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapComponent = ({ organizations: propOrganizations = [], onAddOrganization }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [organizations, setOrganizations] = useState([])
  const [filteredOrganizations, setFilteredOrganizations] = useState([])
  const [map, setMap] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [locationSelectionCallback, setLocationSelectionCallback] = useState(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)

  // Load organizations data from props or fallback to empty array
  useEffect(() => {
    if (propOrganizations && propOrganizations.length > 0) {
      setOrganizations(propOrganizations)
      setFilteredOrganizations(propOrganizations)
    } else {
      // Fallback to empty array instead of undefined organizationsData
      setOrganizations([])
      setFilteredOrganizations([])
    }
  }, [propOrganizations])

  // Function to handle location selection
  const handleLocationSelection = (callback) => {
    if (callback === null) {
      // Exit location selection mode
      setIsSelectingLocation(false)
      setLocationSelectionCallback(null)
      setSelectedCoordinates(null)
    } else {
      // Enter location selection mode
      setIsSelectingLocation(true)
      setLocationSelectionCallback(() => callback)
      // Hide form when entering location selection mode
      setIsFormOpen(false)
    }
  }

  // Function to add new organization
  const handleAddOrganization = (newOrg) => {
    // Use prop function if available, otherwise use local state
    if (onAddOrganization) {
      onAddOrganization(newOrg)
    } else {
      setOrganizations(prev => [...prev, newOrg])
      setFilteredOrganizations(prev => [...prev, newOrg])
    }

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
            <strong>📍 Dirección:</strong><br>
            <a href="#" class="address-link" data-lat="${newOrg.coordinates[0]}" data-lng="${newOrg.coordinates[1]}" style="color: #007bff; text-decoration: none; cursor: pointer;">
              ${newOrg.address}
            </a>
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>📞 Teléfono:</strong> ${newOrg.phone || 'No disponible'}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>🌐 Web:</strong> ${newOrg.website ? `<a href="${newOrg.website}" target="_blank">${newOrg.website}</a>` : 'No disponible'}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>✉️ Email:</strong> ${newOrg.email || 'No disponible'}
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
      const mapInstance = L.map(mapRef.current, {
        zoomControl: false
      }).setView([50.8503, 4.3517], 5) // Brussels center

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
              <strong>📍 Dirección:</strong><br>
              <a href="#" class="address-link" data-lat="${org.coordinates[0]}" data-lng="${org.coordinates[1]}" style="color: #007bff; text-decoration: none; cursor: pointer;">
                ${org.address}
              </a>
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

      // Add event listener for address links in popups
      mapInstance.on('popupopen', (e) => {
        const popup = e.popup
        const addressLinks = popup.getElement().querySelectorAll('.address-link')

        addressLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault()
            const lat = parseFloat(link.dataset.lat)
            const lng = parseFloat(link.dataset.lng)
            openInMaps(lat, lng)
          })
        })
      })

      // Function to open location in maps app
      const openInMaps = (lat, lng) => {
        // Detect iOS device
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

        if (isIOS) {
          // Try to open in Apple Maps first, fallback to Google Maps
          const appleMapsUrl = `maps://maps.apple.com/?q=${lat},${lng}`
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

          // Try to open Apple Maps
          window.location.href = appleMapsUrl

          // Fallback to Google Maps if Apple Maps doesn't open
          setTimeout(() => {
            window.open(googleMapsUrl, '_blank')
          }, 1000)
        } else {
          // Android or Desktop: open Google Maps
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          window.open(googleMapsUrl, '_blank')
        }
      }

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

      // Add filter control (legend) - moved to top left
      const filterControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', ' filter-control')

          const hospitals = organizations.filter(org => org.type === 'hospital')
          const associations = organizations.filter(org => org.type === 'association')

          container.innerHTML = `
            <div class="filter-panel" id="filter-panel">
              <button class="filter-toggle" id="filter-toggle" style="display: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                  <path d="M19 15L19.74 12.74L22 12L19.74 11.26L19 9L18.26 11.26L16 12L18.26 12.74L19 15Z" fill="currentColor"/>
                  <path d="M5 6L5.74 3.74L8 3L5.74 2.26L5 0L4.26 2.26L2 3L4.26 3.74L5 6Z" fill="currentColor"/>
                </svg>
              </button>
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
          const filterPanel = container.querySelector('#filter-panel')
          const filterToggle = container.querySelector('#filter-toggle')

          // Check if mobile and collapse initially
          if (window.innerWidth <= 768) {
            filterPanel.classList.add('collapsed')
            filterToggle.style.display = 'block'
          }

          // Toggle filter panel on mobile
          filterToggle.addEventListener('click', () => {
            filterPanel.classList.toggle('collapsed')
          })

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

      // Add address search control in the top right
      const addressSearchControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', 'address-search-control address-search-center')
          container.innerHTML = `
            <div class="address-search-container" id="address-search-container">
              <input 
                type="text" 
                placeholder="🔍 Buscar dirección..." 
                class="address-search-input"
                id="address-search-input"
              />
              <button class="address-search-btn" id="address-search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="address-results" id="address-results" style="display: none;"></div>
          `

          const input = container.querySelector('#address-search-input')
          const button = container.querySelector('#address-search-btn')
          const resultsContainer = container.querySelector('#address-results')
          const searchContainer = container.querySelector('#address-search-container')

          // Check if mobile and collapse initially
          if (window.innerWidth <= 768) {
            searchContainer.classList.add('collapsed')
          }

          // Toggle search container on mobile
          button.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
              if (searchContainer.classList.contains('collapsed')) {
                // Expand search container
                searchContainer.classList.remove('collapsed')
                searchContainer.classList.add('expanded')
                input.focus()
              } else if (searchContainer.classList.contains('expanded')) {
                // If expanded and has text, perform search
                const query = input.value.trim()
                if (query.length >= 3) {
                  searchAddress(query, resultsContainer, map, input)
                } else {
                  // If no text, collapse back
                  searchContainer.classList.remove('expanded')
                  searchContainer.classList.add('collapsed')
                  resultsContainer.style.display = 'none'
                }
              }
            } else {
              // Desktop: always perform search
              const query = input.value.trim()
              if (query.length >= 3) {
                searchAddress(query, resultsContainer, map, input)
              }
            }
          })

          let searchTimeout

          // Search on input change with debounce
          input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const query = e.target.value.trim()

            if (query.length < 3) {
              resultsContainer.style.display = 'none'
              return
            }

            searchTimeout = setTimeout(() => {
              searchAddress(query, resultsContainer, map, input)
            }, 500)
          })

          // Search on Enter key
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              const query = input.value.trim()
              if (query.length >= 3) {
                searchAddress(query, resultsContainer, map, input)
              }
            }
          })

          // Close search on click outside
          document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && window.innerWidth <= 768) {
              searchContainer.classList.remove('expanded')
              searchContainer.classList.add('collapsed')
              resultsContainer.style.display = 'none'
            }
          })

          return container
        }
      })

      mapInstance.addControl(new addressSearchControl())

      // Add window resize listener for responsive behavior
      const handleResize = () => {
        const filterPanel = document.querySelector('#filter-panel')
        const filterToggle = document.querySelector('#filter-toggle')
        const searchContainer = document.querySelector('#address-search-container')

        if (window.innerWidth <= 768) {
          // Mobile: collapse controls
          if (filterPanel && filterToggle) {
            filterPanel.classList.add('collapsed')
            filterToggle.style.display = 'block'
          }
          if (searchContainer) {
            searchContainer.classList.add('collapsed')
            searchContainer.classList.remove('expanded')
          }
        } else {
          // Desktop: expand controls
          if (filterPanel && filterToggle) {
            filterPanel.classList.remove('collapsed')
            filterToggle.style.display = 'none'
          }
          if (searchContainer) {
            searchContainer.classList.remove('collapsed')
            searchContainer.classList.remove('expanded')
          }
        }
      }

      window.addEventListener('resize', handleResize)

      // Function to search addresses using a mock API (to avoid CORS issues)
      const searchAddress = async (query, resultsContainer, map, inputElement) => {
        try {
          resultsContainer.innerHTML = '<div class="loading">Buscando...</div>'
          resultsContainer.style.display = 'block'

          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500))

          // Mock results for demonstration (you can replace this with a real API call)
          const mockResults = [
            {
              display_name: `${query}, Madrid, España`,
              lat: 40.4168,
              lon: -3.7038
            },
            {
              display_name: `${query}, Barcelona, España`,
              lat: 41.3851,
              lon: 2.1734
            },
            {
              display_name: `${query}, Valencia, España`,
              lat: 39.4699,
              lon: -0.3763
            },
            {
              display_name: `${query}, Sevilla, España`,
              lat: 37.3891,
              lon: -5.9845
            },
            {
              display_name: `${query}, Zaragoza, España`,
              lat: 41.6488,
              lon: -0.8891
            }
          ]

          let resultsHTML = ''
          mockResults.forEach((result, index) => {
            const displayName = result.display_name.split(',').slice(0, 3).join(',')
            resultsHTML += `
              <div class="address-result" data-lat="${result.lat}" data-lon="${result.lon}" data-index="${index}">
                <div class="result-icon">📍</div>
                <div class="result-text">
                  <div class="result-name">${displayName}</div>
                  <div class="result-details">${result.display_name}</div>
                </div>
              </div>
            `
          })

          resultsContainer.innerHTML = resultsHTML

          // Add click events to results
          const resultElements = resultsContainer.querySelectorAll('.address-result')
          resultElements.forEach((element) => {
            element.addEventListener('click', () => {
              const lat = parseFloat(element.dataset.lat)
              const lon = parseFloat(element.dataset.lon)

              // Center map on selected location
              map.setView([lat, lon], 13)

              // Add a temporary marker
              const tempMarker = L.marker([lat, lon], {
                icon: L.divIcon({
                  html: `
                    <div style="
                      background: #3498db;
                      color: white;
                      border-radius: 50%;
                      width: 20px;
                      height: 20px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      border: 3px solid white;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    ">
                      📍
                    </div>
                  `,
                  className: 'address-search-marker',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map)

              // Remove marker after 10 seconds
              setTimeout(() => {
                map.removeLayer(tempMarker)
              }, 10000)

              // Hide results and clear input
              resultsContainer.style.display = 'none'
              inputElement.value = ''
            })
          })

        } catch (error) {
          console.error('Error searching address:', error)
          resultsContainer.innerHTML = '<div class="error">Error en la búsqueda. Intenta de nuevo.</div>'
        }
      }

      // Add add organization control - moved to bottom right and made round
      const addControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', ' add-control')
          container.innerHTML = `
            <button class="add-btn round-btn" title="Añadir nueva organización">
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

      // Add geolocation control - new control at bottom right
      const geolocationControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', ' geolocation-control')
          container.innerHTML = `
            <button class="geolocation-btn round-btn" title="Mi ubicación">
              <span class="geolocation-icon">📍</span>
            </button>
          `

          const button = container.querySelector('button')
          button.addEventListener('click', () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords
                  map.setView([latitude, longitude], 13)

                  // Add a temporary marker for user location
                  const userMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                      html: `
                        <div style="
                          background: #3498db;
                          color: white;
                          border-radius: 50%;
                          width: 20px;
                          height: 20px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 12px;
                          border: 3px solid white;
                          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        ">
                          👤
                        </div>
                      `,
                      className: 'user-location-marker',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })
                  }).addTo(map)

                  // Remove marker after 5 seconds
                  setTimeout(() => {
                    map.removeLayer(userMarker)
                  }, 5000)
                },
                (error) => {
                  console.error('Error getting location:', error)
                  alert('No se pudo obtener tu ubicación. Verifica que tengas permisos de ubicación habilitados.')
                }
              )
            } else {
              alert('Tu navegador no soporta geolocalización.')
            }
          })

          return container
        }
      })

      mapInstance.addControl(new geolocationControl())

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

                // Show form again after location selection
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

              // Show form again after location selection
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
      <div
        ref={mapRef}
        className={`map-viewport ${isSelectingLocation ? 'location-selection-mode' : ''}`}
      ></div>

      {/* Location selection mode indicator */}
      {isSelectingLocation && (
        <div className="location-selection-overlay">
          <div className="location-selection-banner">
            <div className="location-instructions">
              <p>🗺️ <strong>Modo de Selección de Ubicación</strong></p>
              <p>Haga clic en el mapa para seleccionar la ubicación. Los datos del formulario se mantendrán.</p>
            </div>
            <button
              type="button"
              className="btn-secondary location-cancel-btn"
              onClick={() => handleLocationSelection(null)}
            >
              ← Cancelar Selección de Ubicación
            </button>
          </div>
        </div>
      )}

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
