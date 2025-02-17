// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import {
  SapTaskCategory,
  getSapTaskCategoryAPIResponse,
} from "../../../../domain/entities/tot/v1/getSapTaskCategory.js"
import { Constants } from "../../../../config/constants.js"

/** fetch SapTaskCategory */
const SapTaskCategory = async (): Promise<SapTaskCategory[]> => {
  const sapTaskCategoryQuery = `SELECT
  SAP_TASK_CATEGORY_ID 'sap-task-category-id',
  SAP_TASK_CATEGORY_NAME 'sap-task-category-name'
    FROM m_sap_task_category
    ORDER BY SAP_TASK_CATEGORY_ID ASC;`

  return sequelize.query<SapTaskCategory>(sapTaskCategoryQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/* get SapTaskCategory function */
export const getSapTaskCategory = async (): Promise<getSapTaskCategoryAPIResponse> => {
  try {
    const designation = await SapTaskCategory()

    // There is no input here, just return everything.
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: designation,
    }
  } catch (err) {
    logger.error(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

export const getSapTaskCategoryController = jsonResponse(getSapTaskCategory)
