// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidPlantCodeError = {
  readonly _tag: "InvalidPlantCodeError"
  readonly message: string
}

export const invalidPlantCodeError = (t: typeof i18n.__, plantCode: string): InvalidPlantCodeError => ({
  _tag: "InvalidPlantCodeError",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.PLANT_CODE"),
    value: plantCode,
  }),
})
