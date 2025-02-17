// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export const checkPlantCodeValid = (plantCode: string): boolean => {
  if (plantCode == "undefined" || !plantCode || plantCode.length > 10) return false
  return true
}

export const checkPlantAndUnitCodeValid = (plantCode: string, unitCode: string): boolean => {
  if (
    plantCode == "undefined" ||
    !plantCode ||
    unitCode == "undefined" ||
    !unitCode ||
    plantCode.length > 10 ||
    unitCode.length > 10
  )
    return false
  return true
}
