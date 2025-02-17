// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import {
  kpiNegativeSpreadCountsRecord,
  kpiNegativeSpreadRecord,
} from "../../../../domain/models/dpm/negativeSpreadOperation.js"

export type NegativeSpreadRepositoryPort = {
  getTop20NegativeSpreadOperation: (
    plantCode: string,
    forecastCategory: number,
    fiscalYear: number,
    unitCode?: string,
  ) => Promise<kpiNegativeSpreadRecord[]>
  getNegativeSpreadHours: (
    plantCode: string,
    fiscalYear: number,
    unitCode?: string | undefined,
  ) => Promise<kpiNegativeSpreadCountsRecord[]>
}
