import Express from "express"
import { validation } from "../../../interface/routes/dpm/util.js"
import { getFuelPriceForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/fuelPriceForecast.js"
import {
  consolidateGetFuelPriceForecastRequest,
  getFuelPriceForecastController,
} from "../../../interface/controllers/dpm/KPI003/getFuelPriceForecastController.js"
import {
  consolidateUpsertFuelPriceForecastRequest,
  upsertFuelPriceForecastController,
} from "../../../interface/controllers/dpm/KPI003/upsertFuelPriceForecastController.js"
import { upsertFuelPriceForecastRequestDecoder } from "../../../domain/entities/dpm/decoders/fuelPriceForecast.js"
import { FuelPriceRepositorySequelizeMySQL } from "../../repositories/dpm/FuelPriceRepositorySequelizeMySQL.js"
import {
  consolidateGetFuelPricePlanRequest,
  getFuelPricePlanController,
} from "../../../interface/controllers/dpm/KPI003/getFuelPricePlanController.js"
import {
  getFuelPricePlanRequestDecoder,
  upsertFuelPricePlanRequestDecoder,
} from "../../../domain/entities/dpm/decoders/fuelPricePlanDecoder.js"
import {
  consolidateUpsertFuelPricePlanRequest,
  upsertFuelPricePlanController,
} from "../../../interface/controllers/dpm/KPI003/upsertFuelPricePlanController.js"

const route = Express.Router()

export const FuelPriceRoutes = (router: Express.Router): void => {
  router.use("/fuel-cost", route)
  route.get(
    "/forecast",
    validation(consolidateGetFuelPriceForecastRequest)(getFuelPriceForecastRequestDecoder),
    getFuelPriceForecastController,
  )

  // PUT Fuel Price forecast API
  route.put(
    "/forecast",
    validation(consolidateUpsertFuelPriceForecastRequest)(upsertFuelPriceForecastRequestDecoder),
    upsertFuelPriceForecastController(FuelPriceRepositorySequelizeMySQL),
  )

  // GET Fuel Price plan API
  route.get(
    "/plan",
    validation(consolidateGetFuelPricePlanRequest)(getFuelPricePlanRequestDecoder),
    getFuelPricePlanController(FuelPriceRepositorySequelizeMySQL),
  )

  // PUT Fuel Price plan API
  route.put(
    "/plan",
    validation(consolidateUpsertFuelPricePlanRequest)(upsertFuelPricePlanRequestDecoder),
    upsertFuelPricePlanController(FuelPriceRepositorySequelizeMySQL),
  )
}
