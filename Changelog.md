# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 15-10-2025

### Added
- Google Sheets API handler (`/api/google-sheets.js`) for GET/POST requests
- Support for fetching and saving organizations
- Marker icons for hospitals and associations (desktop & mobile)
- Location selection mode and Add Organization form
- Map filter panel with hospital/association toggles
- Search control for organizations
- Google Sheets connection status component

### Fixed
- Prevented infinite reload when the `Hospitales` sheet is empty
- Debounced map marker updates to improve performance
- Correctly memoized popup content to avoid unnecessary re-renders
- Fixed Leaflet icon path issues
- Filter counts now update correctly without infinite loops

### Changed
- App now defaults to `Asociaciones` if `Hospitales` sheet is empty
- `MapComponent` now preserves markers when switching sheets
- Performance logging added for API calls and marker rendering

### Removed
- N/A
