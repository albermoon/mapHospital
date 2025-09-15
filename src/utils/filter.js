export function filterOrganizationsByType(organizations, showHospitals, showAssociations) {
  if (!Array.isArray(organizations)) return []
  return organizations.filter(org => {
    if (org.type === 'hospital' && !showHospitals) return false
    if (org.type === 'association' && !showAssociations) return false
    return true
  })
}

export function computeVisibleCounts(organizations) {
  const result = { hospitals: 0, associations: 0 }
  if (!Array.isArray(organizations)) return result
  for (const org of organizations) {
    if (org.type === 'hospital') result.hospitals += 1
    else if (org.type === 'association') result.associations += 1
  }
  return result
}

