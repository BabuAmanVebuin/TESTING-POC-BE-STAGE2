// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { StartStopCounts } from "../../../../domain/models/dpm/StartStopCounts.js"

export type StartStopCountRepositoryPort = {
  getUnitStartStopCounts: (fiscalYear: number, plantCode: string, unitCode?: string) => Promise<StartStopCounts[]>
  getPlantStartStopCounts: (fiscalYear: number, plantCode: string) => Promise<StartStopCounts[]>
}
