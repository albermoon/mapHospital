import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../l10n/i18n'

const SearchControl = ({ organizations, onSelectOrganization }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef(null)
  const containerRef = useRef(null)
  const isInitialMount = useRef(true)

  // Improved auto-expand logic
  useEffect(() => {
    if (isInitialMount.current) {
      const isMobile = window.innerWidth <= 768
      if (!isMobile) {
        setIsExpanded(true)
      }
      isInitialMount.current = false
    }
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

    setSearchResults(filtered.slice(0, 5))
    setShowResults(filtered.length > 0)
  }, [searchQuery, organizations])


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
        // Don't collapse on mobile when clicking outside, only hide results
        const isMobile = window.innerWidth <= 768
        if (isMobile && !searchQuery) {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchQuery])

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
        }, 100)
      } else {
        // Only clear search and hide results when collapsing
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

    // Don't auto-collapse on mobile after selection
    // Let user decide when to collapse
  }

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  // Handle input blur - don't collapse immediately
  const handleInputBlur = (e) => {
    // Only hide results on blur, don't collapse the search bar
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowResults(false)
      }
    }, 200)
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
          placeholder={t('searchOrganizations')}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button
          className="search-btn"
          onClick={handleToggleSearch}
          title={t('search') || 'Search'}
          type="button"
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