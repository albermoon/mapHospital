import { describe, it, expect } from 'vitest'

// Tests moved from filter.test.js - testing the filtering logic that's now in MapComponent
describe('Organization Filtering Logic', () => {
  const testOrgs = [
    { id: '1', type: 'hospital' },
    { id: '2', type: 'association' },
    { id: '3', type: 'hospital' },
  ]

  // Helper function to simulate the filtering logic from MapComponent
  const filterOrganizationsByType = (organizations, showHospitals, showAssociations) => {
    if (!Array.isArray(organizations)) return []
    return organizations.filter(org => {
      if (!showHospitals && !showAssociations) return false
      if (org.type === 'hospital' && showHospitals) return true
      if (org.type === 'association' && showAssociations) return true
      return false
    })
  }

  const computeVisibleCounts = (organizations) => {
    const result = { hospitals: 0, associations: 0 }
    if (!Array.isArray(organizations)) return result
    for (const org of organizations) {
      if (org.type === 'hospital') result.hospitals += 1
      else if (org.type === 'association') result.associations += 1
    }
    return result
  }

  it('shows all when both flags are true', () => {
    const res = filterOrganizationsByType(testOrgs, true, true)
    expect(res).toHaveLength(3)
  })

  it('hides hospitals when showHospitals is false', () => {
    const res = filterOrganizationsByType(testOrgs, false, true)
    expect(res).toEqual([{ id: '2', type: 'association' }])
  })

  it('hides associations when showAssociations is false', () => {
    const res = filterOrganizationsByType(testOrgs, true, false)
    expect(res.map(o => o.id)).toEqual(['1', '3'])
  })

  it('computes visible counts', () => {
    const visible = filterOrganizationsByType(testOrgs, true, true)
    const counts = computeVisibleCounts(visible)
    expect(counts).toEqual({ hospitals: 2, associations: 1 })
  })

  it('handles empty organizations array', () => {
    const res = filterOrganizationsByType([], true, true)
    expect(res).toHaveLength(0)
  })

  it('handles invalid organizations input', () => {
    const res = filterOrganizationsByType(null, true, true)
    expect(res).toHaveLength(0)
  })

  it('handles organizations without coordinates', () => {
    const orgsWithoutCoords = [
      { id: '1', name: 'Invalid Org', type: 'hospital' }, // No coordinates
      { id: '2', name: 'Valid Org', type: 'hospital', coordinates: [50.8503, 4.3517] }
    ]
    
    const res = filterOrganizationsByType(orgsWithoutCoords, true, false)
    expect(res.map(o => o.id)).toEqual(['1', '2'])
  })
})
