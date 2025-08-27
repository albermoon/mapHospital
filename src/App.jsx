import React from 'react'
import MapComponent from './components/MapComponent'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 Mapa de Organizaciones Sanitarias en Europa</h1>
      </header>
      <main>
        <MapComponent />
      </main>
    </div>
  )
}

export default App
