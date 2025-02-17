// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidGranularityCategoryError = {
  readonly _tag: "InvalidGranularityCategoryError"
  readonly message: string
}

export const invalidGranularityCategoryError = (
  t: typeof i18n.__,
  granularity: string,
): InvalidGranularityCategoryError => ({
  _tag: "InvalidGranularityCategoryError",
  message: t("ERROR.INVALID", {
    fieldName: "granularity",
    value: granularity,
  }),
})
