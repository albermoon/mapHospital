import React, { useState } from 'react'
import { useGoogleSheets } from '../hooks/useGoogleSheets' // Adjust the path according to your structure

const GoogleScriptTester = () => {
  const {
    loading,
    error,
    connected,
    saveData,
    useTestMode
  } = useGoogleSheets(false) // false = production mode

  const [testResults, setTestResults] = useState([])
  const [customData, setCustomData] = useState({
    Name: 'Test Hospital',
    Type: 'Hospital',
    Address: 'Test Street 123',
    Phone: '+34 123 456 789',
    Website: 'https://test.com',
    Email: 'test@test.com',
    Latitude: '40.4168',
    Longitude: '-3.7038',
    Country: 'Spain',
    City: 'Madrid',
    Specialty: 'Cardiology'
  })

  const handleInputChange = (field, value) => {
    setCustomData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const runTest = async (testType) => {
    const timestamp = new Date().toLocaleString()
    
    try {
      let result
      
      if (testType === 'hospital') {
        result = await saveData({
          ...customData,
          Type: 'Hospital',
          ID: `TEST_H_${Date.now()}`
        })
      } else if (testType === 'association') {
        result = await saveData({
          ...customData,
          Type: 'Association',
          Name: customData.Name.replace('Hospital', 'Association'),
          ID: `TEST_A_${Date.now()}`
        })
      } else {
        result = await saveData()
      }

      setTestResults(prev => [{
        timestamp,
        type: testType,
        status: 'success',
        message: result.message,
        data: result
      }, ...prev])

    } catch (err) {
      setTestResults(prev => [{
        timestamp,
        type: testType,
        status: 'error',
        message: err.message,
        data: null
      }, ...prev])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🧪 Google Apps Script Tester</h2>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24',
        border: `1px solid ${connected ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <strong>Status: </strong>
        {connected ? '✅ Connected' : '❌ Disconnected'}
        {useTestMode && ' (Test Mode)'}
      </div>

      {/* Custom Data Form */}
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>📝 Custom Test Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.entries(customData).map(([key, value]) => (
            <div key={key}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                {key}:
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '5px', 
                  border: '1px solid #ccc',
                  borderRadius: '3px'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🚀 Run Tests</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => runTest('default')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Running...' : '🏥 Default Test'}
          </button>

          <button
            onClick={() => runTest('hospital')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Running...' : '🏥 Test Hospital'}
          </button>

          <button
            onClick={() => runTest('association')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Running...' : '🤝 Test Association'}
          </button>

          <button
            onClick={clearResults}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      {/* Show Errors */}
      {error && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Test Results */}
      <div>
        <h3>📊 Test Results ({testResults.length})</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#666' }}>No results yet. Run a test to begin.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: result.status === 'success' ? '#f8f9fa' : '#fff3cd'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <strong>
                    {result.status === 'success' ? '✅' : '❌'} 
                    {result.type.toUpperCase()}
                  </strong>
                  <small style={{ color: '#666' }}>{result.timestamp}</small>
                </div>
                <p><strong>Message:</strong> {result.message}</p>
                {result.data && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                      View complete data
                    </summary>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px'
      }}>
        <h4>ℹ️ Information</h4>
        <ul style={{ marginBottom: '0' }}>
          <li>Make sure you've deployed your Google Apps Script as a web application</li>
          <li>Verify that the script permissions allow anonymous access</li>
          <li>Data will be saved to the corresponding sheet based on the type</li>
        </ul>
      </div>
    </div>
  )
}

export default GoogleScriptTester