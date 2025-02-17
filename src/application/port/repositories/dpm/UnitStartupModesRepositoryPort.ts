// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { StartupModeRecord } from "../../../../domain/models/dpm/StartupModes.js"

/**
 * unitStartupModesRepository type
 */
export type UnitStartupModesRepositoryPort = {
  findUnitStartupModes: (plantCode: string, unitCode?: string | undefined) => Promise<StartupModeRecord[]>
}
