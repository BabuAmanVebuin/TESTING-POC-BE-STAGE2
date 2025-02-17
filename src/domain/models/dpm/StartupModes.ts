// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
/**
 * Repository  unitStartupMode record
 */
export interface StartupModeRecord {
  unitCode: string
  sartupModeCode: string
}

/**
 * Get getStartupModeResponse StartupMode type
 */
export interface StartupMode {
  UnitCode: string
  SartupModeCode: string
  StartupModeName: string
}
// getStartupModeResponse type
export interface getStartupModeResponse {
  PlantCode: string
  StartupModes: StartupMode[]
}
