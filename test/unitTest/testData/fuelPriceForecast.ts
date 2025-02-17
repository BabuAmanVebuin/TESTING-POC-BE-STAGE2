import {
  fuelCostDataType,
  fuelCostPerUnitTotalType,
  fuelPriceForecastDataType,
  fuelUnitCalorificType,
} from "../../../src/domain/entities/dpm/fuelPriceForecast.js"

export const generationOutputForecastInputData: fuelPriceForecastDataType[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2023,
    value: 1168021.28988647,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    value: 1161805.77774047,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2023,
    value: 1549119.78460693,
  },
]

export const thermalEfficienciesForecastInputData: fuelPriceForecastDataType[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2023,
    value: 0.5647221,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    value: 0.5645301,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2023,
    value: 0.5650714,
  },
]

export const fuelCostForecastInputData: fuelCostDataType[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2022,
    value: 115.89696,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2023,
    value: 493.32575,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2022,
    value: 0.82494,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    value: 450.92085,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2023,
    value: 347.52335,
  },
]

export const fuelUnitsCalorificForecastInputData: fuelUnitCalorificType[] = [
  {
    "unit-id": "HE_A100",
    "fuel-unit-calorific-value": 54670,
  },
  {
    "unit-id": "HE_A200",
    "fuel-unit-calorific-value": 54670,
  },
  {
    "unit-id": "HE_A300",
    "fuel-unit-calorific-value": 54670,
  },
]
export const fuelConsumptionActualDataForecastInputData: fuelPriceForecastDataType[] = [
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2022,
    value: 104398.69996,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A100",
    "fiscal-year": 2023,
    value: 390750.69998,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2022,
    value: 856.600008,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A200",
    "fiscal-year": 2023,
    value: 354394.29995,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2022,
    value: 0,
  },
  {
    "plant-id": "HE_",
    "unit-id": "HE_A300",
    "fiscal-year": 2023,
    value: 154473.09999,
  },
]

export const fuelCostPerUnitTotalForecastOutputData: fuelCostPerUnitTotalType[] = [
  {
    "plant-id": "HE_",
    "fiscal-year": 2022,
    value: 110895,
  },
  {
    "plant-id": "HE_",
    "fiscal-year": 2023,
    value: 95556,
  },
]
