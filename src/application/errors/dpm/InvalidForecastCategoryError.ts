// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidForecastCategoryError = {
  readonly _tag: "InvalidForecastCategoryError"
  readonly message: string
}

export const invalidForecastCategoryError = (
  t: typeof i18n.__,
  forecastCategory: string,
): InvalidForecastCategoryError => ({
  _tag: "InvalidForecastCategoryError",
  message: t("ERROR.INVALID", {
    fieldName: "forecastCategory",
    value: forecastCategory,
  }),
})
