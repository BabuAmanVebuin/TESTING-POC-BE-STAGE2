import { Request } from "express"
import { jsonResponseWithErrorHandler } from "../../../decorators.js"
import { OptionalNumber } from "../../tot/v1/utils.js"
import { getGenerationOutputForecastResponse } from "../../../../domain/entities/dpm/generationOutputForecast.js"
import { fixedNumber } from "./helper/businessPlan/businessPlanHelper.js"
import { getGenerationOutputForecastSummaryResponse } from "../../../../domain/entities/dpm/generationOutputForecastSummary.js"
import {
  getThermalEfficiencyPlanSummaryAPIResponse,
  getThermalEfficiencyPlanSummaryRequest,
  getThermalEfficiencyPlanSummaryResponse,
} from "../../../../domain/entities/dpm/thermalEfficiencyPlanSummary.js"
import { getPPAThermalEfficiencyMaster } from "./helper/businessPlan/grossMarginDbHelper.js"
import { wrapInTransaction, wrapInTransactionCmn } from "../../../../infrastructure/orm/sqlize/index.js"
import { getGenerationOutputSalesUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputSalesUsecase.js"
import { GenerationOutputRepositorySequelizeMysql } from "../../../../infrastructure/repositories/dpm/GenerationOutputRepositorySequelizeMySQL.js"
import { ppaThermalEfficiencyType } from "../../../../domain/entities/dpm/grossMarginForecast.js"
import { getGenerationOutputPlanSummaryUsecase } from "../../../../application/use_cases/dpm/getGenerationOutputPlanSummaryUsecase.js"
import { GenerationOutputPlanSummaryData } from "../../../../domain/entities/dpm/generationOutputPlanSummary.js"

const RES_DOT_POSITION = 2

type requestType = getThermalEfficiencyPlanSummaryRequest
type responseType = getThermalEfficiencyPlanSummaryAPIResponse
type responseDataType = getThermalEfficiencyPlanSummaryResponse

type unitId = string
type plnatIdAndFiscalYear = string
type unitWiseHeatInputType = {
  "plant-id": string
  "unit-id": string
  "fiscal-year": number
  value: number
}
type heatInputType = responseDataType

const calculateUnitWiseHeatInput = async (
  generationOutputData: getGenerationOutputForecastResponse[],
  ppaMaster: Record<unitId, ppaThermalEfficiencyType>,
) =>
  generationOutputData.map<unitWiseHeatInputType>((x) => ({
    "plant-id": x["plant-id"],
    "unit-id": x["unit-id"],
    "fiscal-year": x["fiscal-year"],
    value: ppaMaster[x["unit-id"]]?.["ppa-thermal-efficiency"]
      ? fixedNumber(x.sum / ppaMaster[x["unit-id"]]["ppa-thermal-efficiency"])
      : 0,
  }))

const calculateHeatInputSummary = (unitWiseHeatInput: unitWiseHeatInputType[]) =>
  Object.values(
    unitWiseHeatInput.reduce(
      (acc, cur) => {
        if (acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] === undefined) {
          acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = {
            "plant-id": cur["plant-id"],
            "fiscal-year": cur["fiscal-year"],
            value: 0,
          }
        }
        acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`].value += cur.value
        return acc
      },
      {} as Record<plnatIdAndFiscalYear, heatInputType>,
    ),
  )

const calculateThermalEfficiencySummary = (
  heatInput: heatInputType[],
  generationOutputSummaryData: Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse>,
) =>
  heatInput.map((x) => ({
    "plant-id": x["plant-id"],
    "fiscal-year": x["fiscal-year"],
    value: fixedNumber(generationOutputSummaryData[`${x["plant-id"]}:${x["fiscal-year"]}`].value / x.value),
  }))

const calculate = async (
  generationOutputData: getGenerationOutputForecastResponse[],
  generationOutputSummary: Record<plnatIdAndFiscalYear, GenerationOutputPlanSummaryData>,
  ppaMaster: Record<unitId, ppaThermalEfficiencyType>,
): Promise<responseDataType[]> => {
  const heatInput = await calculateUnitWiseHeatInput(generationOutputData, ppaMaster).then(calculateHeatInputSummary)
  return calculateThermalEfficiencySummary(heatInput, generationOutputSummary)
}

const getResDotPosition = (data: responseDataType[]) =>
  data.map((x) => ({
    ...x,
    value: Math.round(x.value * Math.pow(10, RES_DOT_POSITION)) / Math.pow(10, RES_DOT_POSITION), // 小数点第3位を四捨五入
  }))

const getPpaMasterRecord = (master: ppaThermalEfficiencyType[]) =>
  master.reduce(
    (acc, cur) => {
      acc[cur["unit-id"]] = cur
      return acc
    },
    {} as Record<unitId, ppaThermalEfficiencyType>,
  )

const getGenerationOutputSummaryRecord = (data: GenerationOutputPlanSummaryData[]) =>
  data.reduce(
    (acc, cur) => {
      acc[`${cur["plant-id"]}:${cur["fiscal-year"]}`] = cur
      return acc
    },
    {} as Record<plnatIdAndFiscalYear, GenerationOutputPlanSummaryData>,
  )

const getCalculatedData = async (input: requestType): Promise<responseDataType[]> => {
  const [ppaMaster, generationOutput, generationOutputSummary] = await Promise.all([
    wrapInTransactionCmn((transactionCmn) =>
      getPPAThermalEfficiencyMaster(
        {
          plantId: input["plant-id"],
        },
        transactionCmn,
      ),
    ).then(getPpaMasterRecord),
    wrapInTransaction((transaction) =>
      getGenerationOutputSalesUsecase(
        input["plant-id"],
        undefined,
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        undefined,
        undefined,
        GenerationOutputRepositorySequelizeMysql,
        transaction,
      ),
    ),
    wrapInTransaction((transaction) =>
      getGenerationOutputPlanSummaryUsecase(
        input["plant-id"],
        input["start-fiscal-year"],
        input["end-fiscal-year"],
        GenerationOutputRepositorySequelizeMysql,
        transaction,
      ),
    ).then(getGenerationOutputSummaryRecord),
  ])

  return calculate(generationOutput, generationOutputSummary, ppaMaster)
}

const data = (input: requestType) => getCalculatedData(input).then(getResDotPosition)

const controller = async (input: requestType, dataFn = data): Promise<responseType> => {
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

export const consolidateGetThermalEfficiencyPlanSummaryRequest = consolidate
export const getThermalEfficiencyPlanSummary = controller
export const getThermalEfficiencyPlanSummaryController = jsonResponseWithErrorHandler((x) =>
  controller(consolidate(x) as requestType),
)

export const thermalEfficiencyPlanSummaryDataFn = getCalculatedData
