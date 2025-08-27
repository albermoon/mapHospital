# Hospital Map Application

A React application built with Vite that displays an interactive map using Leaflet and OpenStreetMap, featuring hospital locations in New York City.

## Features

- Interactive map with OpenStreetMap tiles
- Hospital markers with popup information
- Search functionality to filter hospitals
- Responsive design
- Built with modern React hooks

## Technologies Used

- React 18
- Vite
- Leaflet (for maps)
- OpenStreetMap (for map tiles)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── MapComponent.jsx    # Main map component with Leaflet integration
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
├── App.css                # Application styles
└── index.css              # Global styles
```

## Customization

- Modify hospital coordinates in `MapComponent.jsx`
- Change the default map center and zoom level
- Add more map controls or features
- Customize the map styling

## License

This project is open source and available under the MIT License.
