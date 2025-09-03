import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import AddOrganizationForm from './AddOrganizationForm'

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
  const [showHospitals, setShowHospitals] = useState(true);
  const [showAssociations, setShowAssociations] = useState(true);
  const [visibleCounts, setVisibleCounts] = useState({ hospitals: 0, associations: 0 });

  // Normalize organizations data
  const normalizeOrganizations = useCallback((rawData) => {
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map(item => {
      const lat = parseFloat(item.Latitude || item.lat);
      const lng = parseFloat(item.Longitude || item.lng);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Skipping ${item.Name || 'unknown'} - invalid coordinates`);
        return null;
      }

      return {
        id: item.ID || `ID_${Date.now()}_${Math.random()}`,
        name: item.Name || item.nombre || 'Unknown Organization',
        type: (item.Type || '').toLowerCase(),
        address: item.Address || item.direccion || '',
        phone: item.Phone || item.teléfono || '',
        website: item.Website || '',
        email: item.Email || '',
        coordinates: [lat, lng],
        country: item.Country || item.pais || '',
        city: item.City || item.ciudad || '',
        specialty: item.Specialty || item.especialidad || '',
        status: item.Status || item.estado || 0
      };
    }).filter(org => org !== null);
  }, []);

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove all existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add markers for filtered organizations
    const isMobile = window.innerWidth <= 768;
    const hospitalIconToUse = isMobile ? hospitalIconMobile : hospitalIcon;
    const associationIconToUse = isMobile ? associationIconMobile : associationIcon;

    filteredOrganizations.forEach(org => {
      if (!org.coordinates || org.coordinates.length !== 2) return;

      const icon = org.type === 'hospital' ? hospitalIconToUse : associationIconToUse;

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
            <strong>🌐 Web:</strong> ${org.website ? `<a href="${org.website}" target="_blank">${org.website}</a>` : 'No disponible'}
          </p>
          <p style="margin: 5px 0; font-size: 12px;">
            <strong>✉️ Email:</strong> ${org.email}
          </p>
        </div>
      `;

      L.marker(org.coordinates, { icon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 300 });
    });
  }, [filteredOrganizations]);

  // Update filter counts and UI
  const updateFilterUI = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const hospitalCount = organizations.filter(org => org.type === 'hospital').length;
    const associationCount = organizations.filter(org => org.type === 'association').length;

    setVisibleCounts({
      hospitals: showHospitals ? hospitalCount : 0,
      associations: showAssociations ? associationCount : 0
    });

    // Update filter control text
    const filterPanel = document.querySelector('#filter-panel');
    if (filterPanel) {
      const hospitalText = filterPanel.querySelector('.filter-text:nth-of-type(1)');
      const associationText = filterPanel.querySelector('.filter-text:nth-of-type(2)');

      if (hospitalText) {
        hospitalText.textContent = `Hospitales (${showHospitals ? hospitalCount : 0}/${hospitalCount})`;
      }
      if (associationText) {
        associationText.textContent = `Asociaciones (${showAssociations ? associationCount : 0}/${associationCount})`;
      }

      // Update checkbox states
      const hospitalCheckbox = filterPanel.querySelector('#hospital-filter');
      const associationCheckbox = filterPanel.querySelector('#association-filter');

      if (hospitalCheckbox) {
        hospitalCheckbox.checked = showHospitals;
      }
      if (associationCheckbox) {
        associationCheckbox.checked = showAssociations;
      }
    }
  }, [organizations, showHospitals, showAssociations]);

  // Filter organizations based on toggle states
  useEffect(() => {
    const filtered = organizations.filter(org => {
      if (org.type === 'hospital' && !showHospitals) return false;
      if (org.type === 'association' && !showAssociations) return false;
      return true;
    });
    setFilteredOrganizations(filtered);
  }, [organizations, showHospitals, showAssociations]);

  // Update markers when filtered organizations change
  useEffect(() => {
    updateMarkers();
    updateFilterUI();
  }, [filteredOrganizations, updateMarkers, updateFilterUI]);

  // Initialize organizations from props
  useEffect(() => {
    if (propOrganizations && propOrganizations.length > 0) {
      const normalized = normalizeOrganizations(propOrganizations)
      setOrganizations(normalized)
      setFilteredOrganizations(normalized)
    } else {
      setOrganizations([])
      setFilteredOrganizations([])
    }
  }, [propOrganizations, normalizeOrganizations])

  // Handle location selection
  const handleLocationSelection = (callback) => {
    if (callback === null) {
      setIsSelectingLocation(false)
      setLocationSelectionCallback(null)
      setSelectedCoordinates(null)
    } else {
      setIsSelectingLocation(true)
      setLocationSelectionCallback(() => callback)
      setIsFormOpen(false)
    }
  }

  // Handle adding a new organization
  const handleAddOrganization = (newOrg) => {
    if (onAddOrganization) {
      onAddOrganization(newOrg)
    } else {
      setOrganizations(prev => [...prev, newOrg])
      setFilteredOrganizations(prev => [...prev, newOrg])
    }

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
      L.marker(newOrg.coordinates, { icon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 300 })
    }
  }

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([50.8503, 4.3517], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance)

      mapInstanceRef.current = mapInstance
      setMap(mapInstance)

      // Add filter control
      const filterControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', 'filter-control');

          const hospitalCount = organizations.filter(org => org.type === 'hospital').length;
          const associationCount = organizations.filter(org => org.type === 'association').length;

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
                  <input type="checkbox" id="hospital-filter" ${showHospitals ? 'checked' : ''}>
                  <span class="filter-icon" style="color: #dc3545;">⚕</span>
                  <span class="filter-text">Hospitales (${showHospitals ? hospitalCount : 0}/${hospitalCount})</span>
                </label>
              </div>
              <div class="filter-item">
                <label class="filter-checkbox">
                  <input type="checkbox" id="association-filter" ${showAssociations ? 'checked' : ''}>
                  <span class="filter-icon" style="color: #007bff;">👥</span>
                  <span class="filter-text">Asociaciones (${showAssociations ? associationCount : 0}/${associationCount})</span>
                </label>
              </div>
            </div>
          `;

          const hospitalFilter = container.querySelector('#hospital-filter');
          const associationFilter = container.querySelector('#association-filter');
          const filterPanel = container.querySelector('#filter-panel');
          const filterToggle = container.querySelector('#filter-toggle');

          if (window.innerWidth <= 768) {
            filterPanel.classList.add('collapsed');
            filterToggle.style.display = 'block';
          }

          filterToggle.addEventListener('click', () => {
            filterPanel.classList.toggle('collapsed');
          });

          hospitalFilter.addEventListener('change', (e) => {
            setShowHospitals(e.target.checked);
          });

          associationFilter.addEventListener('change', (e) => {
            setShowAssociations(e.target.checked);
          });

          return container;
        }
      });

      mapInstance.addControl(new filterControl());

      // Add other controls (keep your existing address search, add organization, geolocation controls)...
      // ... [rest of your map initialization code]

      setMap(mapInstance);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-container">
      <div
        ref={mapRef}
        className={`map-viewport ${isSelectingLocation ? 'location-selection-mode' : ''}`}
      ></div>

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