// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidUnitNameError = {
  readonly _tag: "InvalidUnitNameError"
  readonly message: string
}

export const invalidUnitNameError = (t: typeof i18n.__, plantName: string, unitName: string): InvalidUnitNameError => ({
  _tag: "InvalidUnitNameError",
  message: t("ERROR.INVALID_FOR", {
    fieldName: t("FIELD.UNIT_NAME"),
    value: unitName,
    forFieldName: t("FIELD.PLANT_NAME"),
    forFieldValue: plantName,
  }),
})
