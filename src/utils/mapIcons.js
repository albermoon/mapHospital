import L from 'leaflet'

// Custom icon for hospitals (cross symbol)
export const hospitalIcon = L.divIcon({
  html: `
    <div style="
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      ⚕
    </div>
  `,
  className: 'custom-hospital-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
})

// Custom icon for patient associations (people symbol)
export const associationIcon = L.divIcon({
  html: `
    <div style="
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      👥
    </div>
  `,
  className: 'custom-association-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
})

// Icon for mobile devices (smaller size)
export const hospitalIconMobile = L.divIcon({
  html: `
    <div style="
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      ⚕
    </div>
  `,
  className: 'custom-hospital-icon-mobile',
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5]
})

export const associationIconMobile = L.divIcon({
  html: `
    <div style="
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      👥
    </div>
  `,
  className: 'custom-association-icon-mobile',
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5]
})
