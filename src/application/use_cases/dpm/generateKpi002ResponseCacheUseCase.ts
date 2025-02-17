// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Kpi003RepositoryPort } from "../../../infrastructure/repositories/dpm/snowflake/kpi003RepositorySnowflake.js"
import { getFiscalYear } from "../../utils.js"
import { Kpi002Json } from "../../../domain/models/dpm/Kpi002Json.js"
import { DateTime } from "luxon"

export const generateKpi002JsonCache = async (
  plantCode: string,
  unitCode: string,
  kpi003Repository: Pick<Kpi003RepositoryPort, "getPastAnnualTotalGrossMarginCache" | "getKpi002Data">,
): Promise<Kpi002Json> => {
  const currentFiscalYear = getFiscalYear(DateTime.now())
  const kpi002Json = await kpi003Repository.getKpi002Data(plantCode, unitCode, currentFiscalYear)
  // Retrieve the past total gross margins, which should be pre-calculated and cached already
  const annualTotalGrossMargin = kpi002Json.KPI.AnnualTotalGrossMargin.data
  for (let y = currentFiscalYear - 10; y < currentFiscalYear; y++) {
    annualTotalGrossMargin[y.toString()] = 0
  }

  const pastAnnualTotalGrossMarginMap = await kpi003Repository.getPastAnnualTotalGrossMarginCache(
    plantCode,
    unitCode,
    currentFiscalYear,
  )

  pastAnnualTotalGrossMarginMap.forEach((grossMargin, year) => {
    annualTotalGrossMargin[year.toString()] = grossMargin
  })
  return kpi002Json
}
