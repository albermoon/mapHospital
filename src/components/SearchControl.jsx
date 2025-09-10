import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../utils/i18n'

const SearchControl = ({ organizations, onSelectOrganization }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-expand on desktop, collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      if (!isMobile) {
        setIsExpanded(true)
      } else {
        setIsExpanded(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = organizations.filter(org => {
      return (
        org.name.toLowerCase().includes(query) ||
        org.address.toLowerCase().includes(query) ||
        org.city.toLowerCase().includes(query) ||
        org.country.toLowerCase().includes(query) ||
        (org.specialty && org.specialty.toLowerCase().includes(query)) ||
        org.type.toLowerCase().includes(query)
      )
    })

    setSearchResults(filtered.slice(0, 5)) // Limit to 5 results
    setShowResults(filtered.length > 0)
  }, [searchQuery, organizations])

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleSearch = () => {
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      setIsExpanded(!isExpanded)
      if (!isExpanded) {
        // Focus input when expanding on mobile
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus()
          }
        }, 300)
      } else {
        // Clear search when collapsing
        setSearchQuery('')
        setShowResults(false)
      }
    }
  }

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectResult = (organization) => {
    setSearchQuery('')
    setShowResults(false)
    onSelectOrganization(organization)
    
    // Collapse on mobile after selection
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const getTypeIcon = (type) => {
    return type === 'hospital' ? '🏥' : '👥'
  }

  const getTypeColor = (type) => {
    return type === 'hospital' ? '#dc3545' : '#007bff'
  }

  return (
    <div className="search-control" ref={containerRef}>
      <div className={`search-container ${isExpanded ? 'expanded' : ''}`}>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder={t('searchOrganizations') || 'Search organizations...'}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        <button 
          className="search-btn"
          onClick={handleToggleSearch}
          title={t('search') || 'Search'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(org => (
              <div
                key={org.id}
                className="search-result"
                onClick={() => handleSelectResult(org)}
              >
                <div 
                  className="result-icon"
                  style={{ color: getTypeColor(org.type) }}
                >
                  {getTypeIcon(org.type)}
                </div>
                <div className="result-text">
                  <div className="result-name">{org.name}</div>
                  <div className="result-details">
                    {org.city}, {org.country}
                    {org.specialty && ` • ${org.specialty}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchControl