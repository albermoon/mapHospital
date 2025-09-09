import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hospitalIcon, associationIcon, hospitalIconMobile, associationIconMobile } from '../utils/mapIcons'
import AddOrganizationForm from './AddOrganizationForm'
import { useTranslation } from '../utils/i18n'

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

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove all existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    console.log("Creating markers for filtered organizations:", filteredOrganizations); // Debug log

    // Add markers for filtered organizations
    const isMobile = window.innerWidth <= 768;
    const hospitalIconToUse = isMobile ? hospitalIconMobile : hospitalIcon;
    const associationIconToUse = isMobile ? associationIconMobile : associationIcon;

    filteredOrganizations.forEach(org => {
      if (!org.coordinates || org.coordinates.length !== 2) {
        console.warn('Invalid coordinates for org:', org);
        return;
      }

      console.log(`Creating marker for: ${org.name} (Type: ${org.type})`); // Debug log

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

  const updateFilterUI = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const hospitalCount = organizations.filter(org => org.type === 'hospital').length;
    const associationCount = organizations.filter(org => org.type === 'association').length;

    setVisibleCounts({
      hospitals: showHospitals ? hospitalCount : 0,
      associations: showAssociations ? associationCount : 0
    });

    // Update filter control text safely
    const filterPanel = document.querySelector('#filter-panel');
    if (filterPanel) {
      const hospitalText = filterPanel.querySelector('#hospital-filter')?.closest('.filter-item')?.querySelector('.filter-text');
      const associationText = filterPanel.querySelector('#association-filter')?.closest('.filter-item')?.querySelector('.filter-text');

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
    console.log("All organizations:", organizations); // Debug log
    console.log("Show hospitals:", showHospitals, "Show associations:", showAssociations); // Debug log

    const filtered = organizations.filter(org => {
      const show = true;
      if (org.type === 'hospital' && !showHospitals) return false;
      if (org.type === 'association' && !showAssociations) return false;
      return true;
    });

    console.log("Filtered organizations:", filtered); // Debug log
    setFilteredOrganizations(filtered);
  }, [organizations, showHospitals, showAssociations]);

  // Update markers when filtered organizations change
  useEffect(() => {
    updateMarkers();
    updateFilterUI();
  }, [filteredOrganizations, updateMarkers, updateFilterUI]);

  // Initialize organizations from props (no normalization needed - data is already processed)
  useEffect(() => {
    console.log("Organizations received from props:", propOrganizations); // Debug log

    if (propOrganizations && propOrganizations.length > 0) {
      setOrganizations(propOrganizations);
      setFilteredOrganizations(propOrganizations);
    } else {
      setOrganizations([]);
      setFilteredOrganizations([]);
    }
  }, [propOrganizations]);

  // Handle location selection
  const handleLocationSelection = (callback) => {
    if (callback === null) {
      setIsSelectingLocation(false);
      setLocationSelectionCallback(null);
      setSelectedCoordinates(null);
    } else {
      setIsSelectingLocation(true);
      setLocationSelectionCallback(() => callback);
      setIsFormOpen(false);
    }
  };

  // Handle adding a new organization
  const handleAddOrganization = (newOrg) => {
    if (onAddOrganization) {
      onAddOrganization(newOrg);
    } else {
      setOrganizations(prev => [...prev, newOrg]);
      setFilteredOrganizations(prev => [...prev, newOrg]);
    }

    if (map) {
      const isMobile = window.innerWidth <= 768;
      const icon = newOrg.type === 'hospital' ?
        (isMobile ? hospitalIconMobile : hospitalIcon) :
        (isMobile ? associationIconMobile : associationIcon);

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
      `;
      L.marker(newOrg.coordinates, { icon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 300 });
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([50.8503, 4.3517], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);

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
      // Add organization control
      const addControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },
        onAdd: function (map) {
          const container = L.DomUtil.create('div', 'add-control');

          container.innerHTML = `
      <button class="add-btn round-btn" title="Add Organization">
        <span class="add-icon">+</span>
      </button>
    `;

          const addButton = container.querySelector('.add-btn');
          addButton.addEventListener('click', () => {
            setIsFormOpen(true);
          });

          return container;
        }
      });

      mapInstance.addControl(new addControl());
      mapInstance.addControl(new filterControl());

      // Add other controls (address search, add organization, geolocation) here...
      // ... [keep your existing control code]

      setMap(mapInstance);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [organizations, showHospitals, showAssociations]);

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
              <p>🗺️ <strong>{t('locationSelectionMode')}</strong></p>
              <p>{t('locationSelectionDescription')}</p>
            </div>
            <button
              type="button"
              className="btn-secondary location-cancel-btn"
              onClick={() => handleLocationSelection(null)}
            >
              ← {t('cancel')} {t('selectLocation')}
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
  );
};

export default MapComponent;