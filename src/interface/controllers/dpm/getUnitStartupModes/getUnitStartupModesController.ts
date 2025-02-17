// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619s
import * as E from "fp-ts/lib/Either.js"
import { ApplicationError } from "../../../../application/errors/dpm/index.js"
import { invalidPlantCodeError } from "../../../../application/errors/dpm/InvalidPlantCodeError.js"
import { UnitStartupModesRepositoryPort } from "../../../../application/port/repositories/dpm/UnitStartupModesRepositoryPort.js"
import { StartupMode, StartupModeRecord, getStartupModeResponse } from "../../../../domain/models/dpm/StartupModes.js"
import logger from "../../../../infrastructure/logger.js"
import {
  checkPlantAndUnitCodeValid,
  checkPlantCodeValid,
} from "../../../services/dpm/plantAndUnitValidation/plantAndUnitValidation.js"
import { invalidPlantAndUnitCodeError } from "../../../../application/errors/dpm/InvalidUnitCodeError.js"

/**
 * Controller get unitstartupmodes
 * @param input request inputs
 * @param connection
 * @t language function
 */
export const getUnitStartupModesController = async (
  input: {
    plantCode: string
    unitCode: string
  },
  services: Pick<UnitStartupModesRepositoryPort, "findUnitStartupModes">,
  t: typeof i18n.__,
): Promise<E.Either<ApplicationError, getStartupModeResponse>> => {
  const { plantCode, unitCode } = input
  let startupModesRecord: StartupModeRecord[] = []

  const isPlantCodeValid = await checkPlantCodeValid(plantCode)
  if (!plantCode || !isPlantCodeValid) {
    logger.warn(`Request validation error - Invalid plant code error plantCode :${plantCode}, unitCode: ${unitCode}`)
    return E.left(invalidPlantCodeError(t, plantCode))
  }

  if (unitCode !== "undefined") {
    // validate the combination of plant and unit code
    const isPlantAndUnitCodeValid = await checkPlantAndUnitCodeValid(plantCode, unitCode)
    if (!isPlantAndUnitCodeValid) {
      logger.warn(
        `Request validation error - Invalid plant and unit code error plantCode :${plantCode}, unitCode: ${unitCode}`,
      )
      return E.left(invalidPlantAndUnitCodeError(t, plantCode, unitCode))
    }
    /**
     * Get startupModesRecord  from repository
     */
    startupModesRecord = await services.findUnitStartupModes(plantCode, unitCode)
    logger.debug(`Unit startup modes record count : ${startupModesRecord.length}`)

    return E.right({
      PlantCode: plantCode,
      StartupModes: setStartModeNames(startupModesRecord, t),
    })
  } else {
    /**
     * Get startupModesRecord  from repository
     */
    startupModesRecord = await services.findUnitStartupModes(plantCode)
    logger.debug(`Plant startup modes record count : ${startupModesRecord.length}`)

    return E.right({
      PlantCode: plantCode,
      StartupModes: setStartModeNames(startupModesRecord, t),
    })
  }
}

/**
 * Function to get StartupMode name from SartupModeCode
 * @param startupModesRecord record of startupcode
 * @param t i18n translation
 * @returns StartupMode
 */
function setStartModeNames(startupModesRecord: StartupModeRecord[], t: typeof i18n.__): StartupMode[] {
  return startupModesRecord.map((record) => {
    return {
      UnitCode: record.unitCode,
      SartupModeCode: record.sartupModeCode,
      StartupModeName: t("VALUE." + record.sartupModeCode),
    }
  })
}
