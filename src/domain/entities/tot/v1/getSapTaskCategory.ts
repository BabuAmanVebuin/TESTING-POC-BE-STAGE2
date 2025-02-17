// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/** saptaskcategory data */
export type SapTaskCategory = {
  "sap-task-category-id": number
  "sap-task-category-name"?: string
}

/** saptaskcategory api response */
export type getSapTaskCategoryAPIResponse = {
  code: number
  body: SapTaskCategory[] | string
}
