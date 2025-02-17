// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { Either, right, left } from "fp-ts/lib/Either.js"
import { checkPlantAndUnitCodeValid, checkPlantCodeValid } from "./plantAndUnitValidation/plantAndUnitValidation.js"
import logger from "../../../infrastructure/logger.js"
import { ApplicationError } from "../../../application/errors/dpm/index.js"
import { KPI003APIRequestParams } from "../../../domain/models/dpm/KPI003/Index.js"
import { invalidEpochTimeStampError } from "../../../application/errors/dpm/InvalidEpochTimeStampError.js"
import { invalidPlantCodeError } from "../../../application/errors/dpm/InvalidPlantCodeError.js"
import { invalidPlantAndUnitCodeError } from "../../../application/errors/dpm/InvalidUnitCodeError.js"

export const checkKpi003MeasureValid = (
  plantCode: string,
  unitCode: string | null,
  epochSeconds: number,
  t: typeof i18n.__,
): Either<ApplicationError, KPI003APIRequestParams> => {
  const kpi003APIRequestParams: KPI003APIRequestParams = {
    plantCode: plantCode,
    unitCode: unitCode,
    epochSeconds: epochSeconds,
  }
  if (isNaN(epochSeconds)) {
    logger.warn(`Request validation error - Invalid epochSeconds:${epochSeconds}`)
    return left(invalidEpochTimeStampError(t, epochSeconds))
  }
  const isPlantCodeValid = checkPlantCodeValid(plantCode)
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plantCode:${plantCode}`)
    return left(invalidPlantCodeError(t, plantCode))
  }
  if (unitCode && unitCode !== "undefined") {
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = checkPlantAndUnitCodeValid(plantCode, unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
      )
      return left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
    }
  } else {
    kpi003APIRequestParams.unitCode = null
  }
  return right(kpi003APIRequestParams)
}
