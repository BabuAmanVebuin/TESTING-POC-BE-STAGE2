import { Either, isLeft, right } from "fp-ts/lib/Either.js"
import { DateTime } from "luxon"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { KPI003APIRequestParams } from "../../../domain/models/dpm/KPI003/Index.js"
import { BasicChargeJson } from "../../../domain/models/dpm/BasicChargeJson.js"
import { env } from "../../../infrastructure/env/dpm/index.js"
import { BasicChargeRepositoryPort } from "../../../application/port/repositories/dpm/BasicChargeRepositoryPort.js"
import { checkKpi003MeasureValid } from "../../services/dpm/kpi003MeasureValidation.js"
import { generateBasicChargeResponseUseCase } from "../../../application/use_cases/dpm/generateBasicChargeResponseUseCase.js"

export const getBasicChargeController = async (
  input: KPI003APIRequestParams,
  basicChargeRepository: BasicChargeRepositoryPort,
  t: any,
): Promise<Either<ApplicationError, BasicChargeJson>> => {
  /**
   * Validation
   */
  const validationResult = checkKpi003MeasureValid(input.plantCode, input.unitCode, input.epochSeconds, t)
  if (isLeft(validationResult)) {
    return validationResult
  }

  // Validation passed, Calculate the point in time for the request
  const pointInTime = DateTime.fromSeconds(validationResult.right.epochSeconds)
    .setZone(env.TIMEZONE)
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

  // Generate the BasicCharge JSON
  return right(
    await generateBasicChargeResponseUseCase(
      validationResult.right.plantCode,
      validationResult.right.unitCode,
      pointInTime.toSeconds(),
      basicChargeRepository,
      t,
    ),
  )
}
