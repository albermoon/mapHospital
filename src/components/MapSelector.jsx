import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapSelector.css'

const MapSelector = ({ isOpen, onClose, onLocationSelect, initialCenter = [50.8503, 4.3517] }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (isOpen && mapRef.current) {
      // Clear any existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }

      // Initialize the map with a delay to ensure DOM is ready
      const initMap = () => {
        if (mapRef.current && !mapInstanceRef.current) {
          console.log('Initializing map selector...')
          
          // Initialize the map
          const map = L.map(mapRef.current).setView(initialCenter, 5)

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)

          // Add click event to map
          map.on('click', (e) => {
            console.log('Map clicked:', e.latlng)
            const { lat, lng } = e.latlng
            
            // Remove existing marker
            if (markerRef.current) {
              map.removeLayer(markerRef.current)
            }
            
            // Add new marker
            markerRef.current = L.marker([lat, lng], {
              icon: L.divIcon({
                html: `
                  <div style="
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: bold;
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                  ">
                    📍
                  </div>
                `,
                className: 'location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map)

            // Show coordinates popup briefly
            markerRef.current.bindPopup(`
              <div style="text-align: center; padding: 10px;">
                <strong>✅ Ubicación seleccionada</strong><br>
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}
              </div>
            `).openPopup()

            // Auto-save location after a short delay
            setTimeout(() => {
              onLocationSelect([lat, lng])
              onClose()
            }, 1500)
          })

          mapInstanceRef.current = map
          
          // Force map refresh after initialization
          setTimeout(() => {
            map.invalidateSize()
            console.log('Map size invalidated')
          }, 300)
        }
      }

      // Initialize map after a short delay
      setTimeout(initMap, 200)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [isOpen, initialCenter])

  // Handle map resize when modal opens
  useEffect(() => {
    if (isOpen && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize()
      }, 300)
    }
  }, [isOpen])

  const handleConfirmLocation = () => {
    if (markerRef.current) {
      const latlng = markerRef.current.getLatLng()
      onLocationSelect([latlng.lat, latlng.lng])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="map-selector-overlay" onClick={onClose}>
      <div className="map-selector-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-selector-header">
          <h3>📍 Seleccionar Localización</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="map-selector-instructions">
          <p>Haga clic en el mapa para seleccionar la ubicación</p>
          <p className="instruction-subtitle">La ubicación se guardará automáticamente</p>
        </div>
        
        <div ref={mapRef} className="map-selector-viewport"></div>
        
        <div className="map-selector-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <div className="auto-save-info">
            <span>📍 La ubicación se guardará automáticamente al hacer clic</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapSelector
