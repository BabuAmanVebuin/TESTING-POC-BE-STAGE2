// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { StartUpCostRecord } from "../../../../domain/models/dpm/getStartStopCost.js"

export type StartStopCostsRepositoryPort = {
  getStartStopCost: (
    plantCode: string,
    unitCode: string,
    startupCode: string,
    fiscalYearStartDate: string,
    fiscalYearEndDate: string,
  ) => Promise<StartUpCostRecord[]>
}
