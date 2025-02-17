// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Designation, getDesignationAPIResponse } from "../../../../domain/entities/tot/v1/getDesignation.js"
import { Constants } from "../../../../config/constants.js"

/** fetch designation */
const Desingation = async (): Promise<Designation[]> => {
  const designationQuery = `SELECT
      DESIGNATION_ID 'designation-id',
      DESIGNATION_NAME 'designation-name'
    FROM m_designation
    ORDER BY DESIGNATION_ID ASC;`

  return sequelize.query<Designation>(designationQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/* get designation function */
export const getDesingation = async (): Promise<getDesignationAPIResponse> => {
  try {
    const designation = await Desingation()

    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: designation,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.SERVER_ERROR,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

export const getDesignationController = jsonResponse(getDesingation)
