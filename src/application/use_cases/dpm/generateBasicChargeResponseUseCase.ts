// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { BasicChargeJson } from "../../../domain/models/dpm/BasicChargeJson.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { BasicChargeRepositoryPort } from "../../port/repositories/dpm/BasicChargeRepositoryPort.js"
import { getKpi003ResponseTimeRangeUseCase } from "./getKpi003ResponseTimeRangeUseCase.js"

// Function to generate BasicCharge JSON
export const generateBasicChargeResponseUseCase = async (
  plantCode: string,
  unitCode: string | null,
  timestamp: number,
  basicChargeRepository: BasicChargeRepositoryPort,
  t: any,
): Promise<BasicChargeJson> => {
  // Get the date and time range for KPI003 measurements based on the given timestamp
  const kpi003MeasureDateTimeRange = getKpi003ResponseTimeRangeUseCase(timestamp)

  // Generate the BasicCharge JSON object
  const returnJson: BasicChargeJson = {
    PlantCode: plantCode,
    UnitCode: unitCode,
    Prefix: t("VALUE.PREFIX_YEN"),
    Suffix: t("VALUE.SUFFIX_OKU"),
    BasicCharge: await basicChargeRepository.getBasicCharge(
      plantCode,
      unitCode,
      kpi003MeasureDateTimeRange.annualEstimatesStart,
      env.KPI003_YEAR_HALF_RANGE * 2,
    ),
  }
  return returnJson
}
