// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
/** task category data */
export type taskCategory = {
  "task-category-id": string
  "task-category-name": string
}

/** plant section api response param */
export type gettaskCategoryAPIResponse = {
  code: number
  body: taskCategory[] | string
}
