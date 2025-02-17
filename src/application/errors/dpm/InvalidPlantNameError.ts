// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidPlantNameError = {
  readonly _tag: "InvalidPlantNameError"
  readonly message: string
}

export const invalidPlantNameError = (t: typeof i18n.__, plantName: string): InvalidPlantNameError => ({
  _tag: "InvalidPlantNameError",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.PLANT_NAME"),
    value: plantName,
  }),
})
