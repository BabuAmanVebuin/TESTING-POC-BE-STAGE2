// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/** taskType data */
export type TaskType = {
  "task-type-id": number
  "task-type-name": string
  "task-category-id": number
  "task-category-name": string
  "task-execution-time": string
  "event-type-id": number | null
  "event-type-name": string | null
  "is-attached-with-sap": boolean | number
}

/** taskType api response */
export type getTaskTypeAPIResponse = {
  code: number
  body: TaskType[] | string
}

/** taskType api request param */
export type getTaskTypeRequest = {
  "delete-status": boolean
}
