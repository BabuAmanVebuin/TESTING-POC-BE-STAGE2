// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidPlantAndUnitCodeError = {
  readonly _tag: "InvalidPlantAndUnitCodeError"
  readonly message: string
}

export const invalidPlantAndUnitCodeError = (
  t: typeof i18n.__,
  plantCode: string,
  unitCode: string,
): InvalidPlantAndUnitCodeError => ({
  _tag: "InvalidPlantAndUnitCodeError",
  message: t("ERROR.INVALID_FOR", {
    fieldName: t("FIELD.UNIT_CODE"),
    value: unitCode,
    forFieldName: t("FIELD.PLANT_CODE"),
    forFieldValue: plantCode,
  }),
})
