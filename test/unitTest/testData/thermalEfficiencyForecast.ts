import {
  decreaseType,
  getThermalEfficiencyForecastResponse,
  recoveryType,
  stoppageType,
} from "../../../src/domain/entities/dpm/thermalEfficiencyForecast.js"

type responseData = getThermalEfficiencyForecastResponse

type unitId = string
type unitIdAndFiscalYear = string
type unitIdAndStoppageCode = string

export const currentFiscalYearSfData: Record<unitId, responseData> = {
  ["HE_A100"]: {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2023,
    "correction-value": null,
    value: null,
    sum: 56.12,
  },
  ["HE_A200"]: {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    "correction-value": null,
    value: null,
    sum: 55.97,
  },
  ["HE_A300"]: {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    "correction-value": null,
    value: null,
    sum: 56.14,
  },
}

export const unitList: string[] = ["HE_A100", "HE_A200", "HE_A300"]

export const stoppageList: Record<unitIdAndFiscalYear, stoppageType[]> = {
  ["HE_A100:2023"]: [
    {
      "fiscal-year": 2023,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2024"]: [
    {
      "fiscal-year": 2024,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A100",
    },
    {
      "fiscal-year": 2024,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2025"]: [
    {
      "fiscal-year": 2025,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2026"]: [
    {
      "fiscal-year": 2026,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A100",
    },
    {
      "fiscal-year": 2026,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2027"]: [
    {
      "fiscal-year": 2027,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2028"]: [
    {
      "fiscal-year": 2028,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2029"]: [
    {
      "fiscal-year": 2029,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2030"]: [
    {
      "fiscal-year": 2030,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2031"]: [
    {
      "fiscal-year": 2031,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A100:2032"]: [
    {
      "fiscal-year": 2030,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A100",
    },
  ],
  ["HE_A200:2023"]: [
    {
      "fiscal-year": 2023,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2024"]: [
    {
      "fiscal-year": 2024,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2025"]: [
    {
      "fiscal-year": 2025,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
    {
      "fiscal-year": 2025,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2026"]: [
    {
      "fiscal-year": 2026,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2027"]: [
    {
      "fiscal-year": 2027,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2028"]: [
    {
      "fiscal-year": 2028,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A200",
    },
    {
      "fiscal-year": 2028,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2029"]: [
    {
      "fiscal-year": 2026,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2030"]: [
    {
      "fiscal-year": 2030,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2031"]: [
    {
      "fiscal-year": 2031,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A200:2033"]: [
    {
      "fiscal-year": 2033,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A200",
    },
  ],
  ["HE_A300:2023"]: [
    {
      "fiscal-year": 2023,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
    {
      "fiscal-year": 2023,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2025"]: [
    {
      "fiscal-year": 2025,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
    {
      "fiscal-year": 2025,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2026"]: [
    {
      "fiscal-year": 2026,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2027"]: [
    {
      "fiscal-year": 2027,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2028"]: [
    {
      "fiscal-year": 2028,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2029"]: [
    {
      "fiscal-year": 2029,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2030"]: [
    {
      "fiscal-year": 2030,
      "type-of-stoppage-text": "FFF",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2031"]: [
    {
      "fiscal-year": 2031,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2032"]: [
    {
      "fiscal-year": 2032,
      "type-of-stoppage-text": "MMH",
      "unit-id": "HE_A300",
    },
  ],
  ["HE_A300:2033"]: [
    {
      "fiscal-year": 2033,
      "type-of-stoppage-text": "MMC",
      "unit-id": "HE_A300",
    },
  ],
}

export const recoveryMaster: Record<unitIdAndStoppageCode, recoveryType> = {
  ["HE_A100:MMC"]: {
    "unit-id": "HE_A100",
    "type-of-stoppage-text": "MMC",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A100:MMH"]: {
    "unit-id": "HE_A100",
    "type-of-stoppage-text": "MMH",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A100:MMF"]: {
    "unit-id": "HE_A100",
    "type-of-stoppage-text": "MMF",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A100:FFF"]: {
    "unit-id": "HE_A100",
    "type-of-stoppage-text": "FFF",
    "thermal-efficiency-recovery": 0.35,
  },
  ["HE_A100:FSF"]: {
    "unit-id": "HE_A100",
    "type-of-stoppage-text": "FSF",
    "thermal-efficiency-recovery": 0.35,
  },
  ["HE_A200:MMC"]: {
    "unit-id": "HE_A200",
    "type-of-stoppage-text": "MMC",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A200:MMH"]: {
    "unit-id": "HE_A200",
    "type-of-stoppage-text": "MMH",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A200:MMF"]: {
    "unit-id": "HE_A200",
    "type-of-stoppage-text": "MMF",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A200:FFF"]: {
    "unit-id": "HE_A200",
    "type-of-stoppage-text": "FFF",
    "thermal-efficiency-recovery": 0.35,
  },
  ["HE_A200:FSF"]: {
    "unit-id": "HE_A200",
    "type-of-stoppage-text": "FSF",
    "thermal-efficiency-recovery": 0.35,
  },
  ["HE_A300:MMC"]: {
    "unit-id": "HE_A300",
    "type-of-stoppage-text": "MMC",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A300:MMH"]: {
    "unit-id": "HE_A300",
    "type-of-stoppage-text": "MMH",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A300:MMF"]: {
    "unit-id": "HE_A300",
    "type-of-stoppage-text": "MMF",
    "thermal-efficiency-recovery": 0,
  },
  ["HE_A300:FFF"]: {
    "unit-id": "HE_A300",
    "type-of-stoppage-text": "FFF",
    "thermal-efficiency-recovery": 0.35,
  },
  ["HE_A300:FSF"]: {
    "unit-id": "HE_A300",
    "type-of-stoppage-text": "FSF",
    "thermal-efficiency-recovery": 0.35,
  },
}

export const decreaseMaster: Record<unitId, decreaseType> = {
  ["HE_A100"]: {
    "unit-id": "HE_A100",
    "thermal-efficiency-decrease": -0.17,
  },
  ["HE_A200"]: {
    "unit-id": "HE_A200",
    "thermal-efficiency-decrease": -0.17,
  },
  ["HE_A300"]: {
    "unit-id": "HE_A300",
    "thermal-efficiency-decrease": -0.17,
  },
}

export const result: responseData[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2024,
    "correction-value": null,
    value: 56.13,
    sum: 56.13,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2024,
    "correction-value": null,
    value: 55.8,
    sum: 55.8,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2024,
    "correction-value": null,
    value: 55.97,
    sum: 55.97,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2025,
    "correction-value": null,
    value: 56.13,
    sum: 56.13,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2025,
    "correction-value": null,
    value: 55.63,
    sum: 55.63,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2025,
    "correction-value": null,
    value: 55.8,
    sum: 55.8,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2026,
    "correction-value": null,
    value: 56.14,
    sum: 56.14,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2026,
    "correction-value": null,
    value: 55.64,
    sum: 55.64,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2026,
    "correction-value": null,
    value: 55.81,
    sum: 55.81,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2027,
    "correction-value": null,
    value: 56.14,
    sum: 56.14,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2027,
    "correction-value": null,
    value: 55.64,
    sum: 55.64,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2027,
    "correction-value": null,
    value: 55.81,
    sum: 55.81,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2028,
    "correction-value": null,
    value: 55.97,
    sum: 55.97,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2028,
    "correction-value": null,
    value: 55.47,
    sum: 55.47,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2028,
    "correction-value": null,
    value: 55.64,
    sum: 55.64,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2029,
    "correction-value": null,
    value: 55.98,
    sum: 55.98,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2029,
    "correction-value": null,
    value: 55.48,
    sum: 55.48,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2029,
    "correction-value": null,
    value: 55.47,
    sum: 55.47,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2030,
    "correction-value": null,
    value: 55.98,
    sum: 55.98,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2030,
    "correction-value": null,
    value: 55.48,
    sum: 55.48,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2030,
    "correction-value": null,
    value: 55.48,
    sum: 55.48,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2031,
    "correction-value": null,
    value: 55.81,
    sum: 55.81,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2031,
    "correction-value": null,
    value: 55.31,
    sum: 55.31,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2031,
    "correction-value": null,
    value: 55.48,
    sum: 55.48,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2032,
    "correction-value": null,
    value: 55.64,
    sum: 55.64,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2032,
    "correction-value": null,
    value: 55.14,
    sum: 55.14,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2032,
    "correction-value": null,
    value: 55.31,
    sum: 55.31,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2033,
    "correction-value": null,
    value: 55.47,
    sum: 55.47,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2033,
    "correction-value": null,
    value: 54.97,
    sum: 54.97,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2033,
    "correction-value": null,
    value: 55.14,
    sum: 55.14,
  },
]
