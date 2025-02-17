import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { calcEbitdaSummaryData, getEbitdaSummarySfData, truncEbitda } from "./helper/businessPlan/ebitdaHelper.js"
import { BasicChargeRepositorySequelizeMySQL } from "../../../../infrastructure/repositories/dpm/BasicChargeRepositorySequelizeMySQL.js"
import { wrapInTransaction } from "../../../../infrastructure/orm/sqlize/index.js"
import { currentFiscalYear } from "./helper/businessPlan/businessPlanHelper.js"
import { getOpexForecastSummaryFn } from "./getOpexForecastSummaryController.js"
import { getBasicChargeForecastSummaryUsecase } from "../../../../application/use_cases/dpm/getBasicChargeForecastSummaryUseCase.js"
import {
  getEbitdaForecastSummaryAPIResponse,
  getEbitdaForecastSummaryRequest,
} from "../../../../domain/entities/dpm/ebitdaForecastSummary.js"
import { getOpexForecastSummaryResponse } from "../../../../domain/entities/dpm/opexForecastSummary.js"
import { getBasicChargeForecastSummaryData } from "../../../../domain/entities/dpm/basicChargeForecastSummary.js"
import { getGrossMarginForecastSummaryFn } from "./helper/businessPlan/grossMarginHelper.js"
import { getGrossMarginForecastSummaryResponse } from "../../../../domain/entities/dpm/grossMarginForecastSummary.js"
import { wrapInSnowflakeTransaction } from "../../../../infrastructure/orm/snowflake/index.js"

type requestType = getEbitdaForecastSummaryRequest
type responseType = getEbitdaForecastSummaryAPIResponse
type responseDataType = getGrossMarginForecastSummaryResponse

const data = (
  input: requestType,
): Promise<
  [
    responseDataType[],
    getGrossMarginForecastSummaryResponse[],
    getBasicChargeForecastSummaryData[],
    getOpexForecastSummaryResponse[],
  ]
> =>
  Promise.all([
    wrapInSnowflakeTransaction((snowflakeTransaction) => getEbitdaSummarySfData(input, snowflakeTransaction)),
    getGrossMarginForecastSummaryFn(input).then((x) => x.calculatedGrossMarginData),
    wrapInTransaction((transaction) =>
      getBasicChargeForecastSummaryUsecase(
        BasicChargeRepositorySequelizeMySQL,
        transaction,
        currentFiscalYear(),
        input["plant-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
      ),
    ),
    getOpexForecastSummaryFn(input),
  ])

const calculateEbitda = (
  grossMargin: getGrossMarginForecastSummaryResponse[],
  basicCharge: getBasicChargeForecastSummaryData[],
  opex: getOpexForecastSummaryResponse[],
): responseDataType[] => truncEbitda(calcEbitdaSummaryData(grossMargin, basicCharge, opex))

const getData = async (input: requestType) => {
  const [ebitdaSf, grossMargin, basicCharge, opex] = await data(input)
  const ebitdadb = calculateEbitda(grossMargin, basicCharge, opex)
  return [ebitdaSf, ebitdadb].flat()
}

const controller = async (input: requestType, dataFn = getData): Promise<responseType> => {
  return {
    code: 200,
    body: await dataFn(input),
  }
}

const consolidate = (request: Request): requestType => ({
  "plant-id": request.query["plant-id"] as string,
  "start-fiscal-year": OptionalNumber(request.query["start-fiscal-year"]),
  "end-fiscal-year": OptionalNumber(request.query["end-fiscal-year"]),
})

export const consolidateGetEbitdaForecastSummaryRequest = consolidate
export const getEbitdaForecastSummary = controller
export const getEbitdaForecastSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)

export const calcEbitdaSummaryTestFn = (
  grossMargin: getGrossMarginForecastSummaryResponse[],
  basicCharge: getBasicChargeForecastSummaryData[],
  opex: getOpexForecastSummaryResponse[],
): responseDataType[] => truncEbitda(calculateEbitda(grossMargin, basicCharge, opex))

export const testCalcEbitdaSummary = calculateEbitda
export const dataForecastSummaryFn = data
