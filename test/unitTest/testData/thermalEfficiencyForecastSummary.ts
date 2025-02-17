import { getGenerationOutputForecastResponse } from "../../../src/domain/entities/dpm/generationOutputForecast.js"
import { getGenerationOutputForecastSummaryResponse } from "../../../src/domain/entities/dpm/generationOutputForecastSummary.js"
import { getThermalEfficiencyForecastSummaryResponse } from "../../../src/domain/entities/dpm/thermalEfficiencyForecastSummary.js"
import { thermalEfficiency } from "./grossMarginForecast.js"

type responseData = getThermalEfficiencyForecastSummaryResponse

type plnatIdAndFiscalYear = string

export const generationOutputData: getGenerationOutputForecastResponse[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2024,
    value: 4146.88,
    "correction-value": 0,
    sum: 4146.88,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2025,
    value: 4098.76,
    "correction-value": 0,
    sum: 4098.76,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2026,
    value: 3854.75,
    "correction-value": 0,
    sum: 3854.75,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2027,
    value: 4035.16,
    "correction-value": 0,
    sum: 4035.16,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2028,
    value: 3713,
    "correction-value": 0,
    sum: 3713,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2029,
    value: 3528.4,
    "correction-value": 0,
    sum: 3528.4,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2030,
    value: 3879.57,
    "correction-value": 0,
    sum: 3879.57,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2031,
    value: 3704.27,
    "correction-value": 0,
    sum: 3704.27,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2032,
    value: 3452.82,
    "correction-value": 0,
    sum: 3452.82,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2033,
    value: 3437.19,
    "correction-value": 0,
    sum: 3437.19,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2024,
    value: 4146.88,
    "correction-value": 0,
    sum: 4146.88,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2025,
    value: 4098.76,
    "correction-value": 0,
    sum: 4098.76,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2026,
    value: 3854.75,
    "correction-value": 0,
    sum: 3854.75,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2027,
    value: 4035.16,
    "correction-value": 0,
    sum: 4035.16,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2028,
    value: 3713,
    "correction-value": 0,
    sum: 3713,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2029,
    value: 3528.4,
    "correction-value": 0,
    sum: 3528.4,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2030,
    value: 3879.57,
    "correction-value": 0,
    sum: 3879.57,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2031,
    value: 3704.27,
    "correction-value": 0,
    sum: 3704.27,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2032,
    value: 3452.82,
    "correction-value": 0,
    sum: 3452.82,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2033,
    value: 3437.19,
    "correction-value": 0,
    sum: 3437.19,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2024,
    value: 4146.88,
    "correction-value": 0,
    sum: 4146.88,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2025,
    value: 4098.76,
    "correction-value": 0,
    sum: 4098.76,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2026,
    value: 3854.75,
    "correction-value": 0,
    sum: 3854.75,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2027,
    value: 4035.16,
    "correction-value": 0,
    sum: 4035.16,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2028,
    value: 3713,
    "correction-value": 0,
    sum: 3713,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2029,
    value: 3528.4,
    "correction-value": 0,
    sum: 3528.4,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2030,
    value: 3879.57,
    "correction-value": 0,
    sum: 3879.57,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2031,
    value: 3704.27,
    "correction-value": 0,
    sum: 3704.27,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2032,
    value: 3452.82,
    "correction-value": 0,
    sum: 3452.82,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2033,
    value: 3437.19,
    "correction-value": 0,
    sum: 3437.19,
  },
]

export const generationOutputSummaryRecord: Record<plnatIdAndFiscalYear, getGenerationOutputForecastSummaryResponse> = {
  ["HE_:2024"]: {
    "plant-id": "HE_",
    "fiscal-year": 2024,
    value: 12440.64,
  },
  ["HE_:2025"]: {
    "plant-id": "HE_",
    "fiscal-year": 2025,
    value: 12296.28,
  },
  ["HE_:2026"]: {
    "plant-id": "HE_",
    "fiscal-year": 2026,
    value: 11564.25,
  },
  ["HE_:2027"]: {
    "plant-id": "HE_",
    "fiscal-year": 2027,
    value: 12105.48,
  },
  ["HE_:2028"]: {
    "plant-id": "HE_",
    "fiscal-year": 2028,
    value: 11139,
  },
  ["HE_:2029"]: {
    "plant-id": "HE_",
    "fiscal-year": 2029,
    value: 10585.2,
  },
  ["HE_:2030"]: {
    "plant-id": "HE_",
    "fiscal-year": 2030,
    value: 11638.71,
  },
  ["HE_:2031"]: {
    "plant-id": "HE_",
    "fiscal-year": 2031,
    value: 11112.81,
  },
  ["HE_:2032"]: {
    "plant-id": "HE_",
    "fiscal-year": 2032,
    value: 10358.46,
  },
  ["HE_:2033"]: {
    "plant-id": "HE_",
    "fiscal-year": 2033,
    value: 10311.57,
  },
}

export const thermalEfficiencyRecord = thermalEfficiency

export const result: responseData[] = [
  {
    "plant-id": "HE_",
    "fiscal-year": 2024,
    value: 55.96,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2025,
    value: 55.85,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2026,
    value: 55.86,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2027,
    value: 55.86,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2028,
    value: 55.69,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2029,
    value: 55.64,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2030,
    value: 55.64,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2031,
    value: 55.53,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2032,
    value: 55.36,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2033,
    value: 55.19,
  },
]
