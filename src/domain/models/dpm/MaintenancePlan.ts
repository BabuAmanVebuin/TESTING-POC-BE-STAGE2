// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { IntervalUnit } from "../../../config/dpm/enums.js"

/**
 * MaintenancePlan Event data
 */
export interface Interval {
  seq: number
  length: number
  unit: IntervalUnit
}
export interface MaintenancePlan {
  maintenancePlanId: string
  maintenancePlanName: string
  assetCode: string
  plantCode: string
  intervals: Interval[]
  isDeleted: boolean | null
}
