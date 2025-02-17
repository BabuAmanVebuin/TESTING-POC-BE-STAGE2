// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/**
 * Description operation data
 *
 * @export
 * @typedef {Operation} operation data
 */
export type Operation = {
  "operation-id": number
  "operation-name"?: string
}

/**
 * Description operation api response
 *
 * @export
 * @typedef {getOperationAPIResponse}
 */
export type getOperationAPIResponse = {
  code: number
  body: Operation[] | string
}
