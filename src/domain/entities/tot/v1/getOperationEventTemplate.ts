// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/** operation-event-template data */
export type OperationEventTemplate = {
  "task-type-id": number
  "task-type-name": string
  "task-category-id": number
  "task-category-name": string
  "task-execution-time": string
  "event-type-id": number | null
  "event-type-name": string | null
  "operation-id": number
  "operation-name": string
}

/** operation-event-template api response */
export type getOperationEventTemplateAPIResponse = {
  code: number
  body: OperationEventTemplate[] | string
}

/** operation-event-template api request param */
export type getOperationEventTemplateRequest = {
  "delete-status": boolean
}
