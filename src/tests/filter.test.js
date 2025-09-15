import { describe, it, expect } from 'vitest'
import { filterOrganizationsByType, computeVisibleCounts } from '../utils/filter'

const orgs = [
  { id: '1', type: 'hospital' },
  { id: '2', type: 'association' },
  { id: '3', type: 'hospital' },
]

describe('filterOrganizationsByType', () => {
  it('shows all when both flags are true', () => {
    const res = filterOrganizationsByType(orgs, true, true)
    expect(res).toHaveLength(3)
  })

  it('hides hospitals when showHospitals is false', () => {
    const res = filterOrganizationsByType(orgs, false, true)
    expect(res).toEqual([{ id: '2', type: 'association' }])
  })

  it('hides associations when showAssociations is false', () => {
    const res = filterOrganizationsByType(orgs, true, false)
    expect(res.map(o => o.id)).toEqual(['1', '3'])
  })

  it('computes visible counts', () => {
    const visible = filterOrganizationsByType(orgs, true, true)
    const counts = computeVisibleCounts(visible)
    expect(counts).toEqual({ hospitals: 2, associations: 1 })
  })
})


