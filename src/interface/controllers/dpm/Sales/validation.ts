// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { BAD_REQUEST, CONST_VARIABLE, NOT_FOUND, SUCCESS } from "../../../../config/dpm/constant.js"
import { getSalesPriceRequest } from "../../../../domain/entities/dpm/getSalesPrice.js"
import { PlantAndUnitCode } from "../../../../domain/models/dpm/PlantAndUnitCode.js"
import { Result } from "../../../../domain/models/dpm/SalesPriceData.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../../infrastructure/orm/snowflake/index.js"
import { IS_PLANT_UNIT_EXIST_QUERY } from "./sqlQuery.js"

export const validateInput = async (
  snowflakeTransaction: SnowflakeTransaction,
  input: getSalesPriceRequest,
): Promise<{
  isValid: boolean
  errorResponse: {
    code: number
    body: string
  }
}> => {
  let isValid = true
  let validationResponse: Result = {
    code: SUCCESS.CODE,
    body: "",
  }

  //request parameter validation
  if (input.plantId.length <= 0 || input.plantId.length > 10 || input.unitId.length <= 0 || input.unitId.length > 10) {
    isValid = false
    validationResponse = {
      code: BAD_REQUEST.CODE,
      body: BAD_REQUEST.MESSAGE(),
    }
  }

  //Plant ID and UnitID validation against database
  if (isValid) {
    isValid = await isPlantAndUnitIDExist(snowflakeTransaction, input.plantId, input.unitId)

    if (!isValid) {
      validationResponse = {
        code: NOT_FOUND.CODE,
        body: NOT_FOUND.MESSAGE(CONST_VARIABLE.PLANT_ID + "," + CONST_VARIABLE.UNIT_ID),
      }
    }
  }

  return {
    isValid: isValid,
    errorResponse: validationResponse,
  }
}

export const isPlantAndUnitIDExist = async (
  snowflakeTransaction: SnowflakeTransaction,
  plantID: string,
  unitID: string,
): Promise<boolean> => {
  let isPlantUnitExist = true
  const unitPlantRecord = await snowflakeSelectWrapper<PlantAndUnitCode>(snowflakeTransaction, {
    sqlText: IS_PLANT_UNIT_EXIST_QUERY,
    binds: [plantID, unitID],
  })

  if (unitPlantRecord.length === 0) {
    isPlantUnitExist = false
  }
  return isPlantUnitExist
}
