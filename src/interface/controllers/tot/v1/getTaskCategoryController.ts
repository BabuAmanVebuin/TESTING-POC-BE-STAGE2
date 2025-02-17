// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { QueryTypes } from "sequelize"
import { sequelize } from "../../../../infrastructure/orm/sqlize/index.js"
import { jsonResponse } from "../../../decorators.js"
import logger from "../../../../infrastructure/logger.js"
import { Constants } from "../../../../config/constants.js"
import { gettaskCategoryAPIResponse, taskCategory } from "../../../../domain/entities/tot/v1/TaskCategory.js"
/** fetch task category data */
const getTaskCategoryData = async (): Promise<taskCategory[]> => {
  const taskCategoryQuery = `SELECT 
  distinct TASK_CATEGORY_ID 'task-category-id', 
  TASK_CATEGORY_NAME 'task-category-name'
  FROM m_task_type
  ORDER BY TASK_CATEGORY_ID ASC`

  return sequelize.query<taskCategory>(taskCategoryQuery, {
    raw: true,
    type: QueryTypes.SELECT,
    replacements: {},
  })
}

/**  get task category function */
const getTaskCategory = async (): Promise<gettaskCategoryAPIResponse> => {
  try {
    const taskCategory = await getTaskCategoryData()
    return {
      code: Constants.STATUS_CODES.SUCCESS_CODE,
      body: taskCategory,
    }
  } catch (err) {
    logger.warn(err)
    return {
      code: Constants.ERROR_CODES.BAD_REQUEST,
      body: Constants.ERROR_MESSAGES.BAD_REQUEST,
    }
  }
}

/** export get task category controller */
export const getTaskCategoryController = jsonResponse(getTaskCategory)
