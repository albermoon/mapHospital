export function filterOrganizationsByType(organizations, showHospitals, showAssociations) {
  if (!Array.isArray(organizations)) return []
  return organizations.filter(org => {
    if (org.type === 'hospital' && !showHospitals) return false
    if (org.type === 'association' && !showAssociations) return false
    return true
  })
}

