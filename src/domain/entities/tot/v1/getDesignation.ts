// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/** designation data */
export type Designation = {
  "designation-id": number
  "designation-name"?: string
}

/** designation api response */
export type getDesignationAPIResponse = {
  code: number
  body: Designation[] | string
}
