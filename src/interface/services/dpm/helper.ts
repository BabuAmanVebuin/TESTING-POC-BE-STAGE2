// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { COMMON_CONST } from "../../../config/dpm/constant.js"

export const formateUnitCode = (plant_id: string): string => {
  if (plant_id === COMMON_CONST.OOT_SHINNAGOYA_PLANT_ID) {
    return COMMON_CONST.DPM_SHINNAGOYA_PLANT_CODE
  }
  return plant_id.replace(/1/g, "").padEnd(3, "_")
}

export const getDPMPlantId = (plantCode: string): string => {
  return plantCode.replace(/_/g, "").padStart(4, "1")
}
