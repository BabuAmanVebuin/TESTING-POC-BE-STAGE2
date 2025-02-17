// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/** eventType data */
export type EventType = {
  "event-type-id": number
  "event-type-name": string
  "operation-id": number
  "operation-name": string
  "is-attached-with-sap": boolean | number
}

/** eventType api response */
export type getEventTypeAPIResponse = {
  code: number
  body: EventType[] | string
}

/** eventType api request param */
export type getEventTypeRequest = {
  "delete-status": boolean
}
