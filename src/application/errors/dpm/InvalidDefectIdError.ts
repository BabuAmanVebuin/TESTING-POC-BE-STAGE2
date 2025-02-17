// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidDefectIdError = {
  readonly _tag: "InvalidDefectIdError"
  readonly message: string
}

export const invalidDefectIdError = (t: typeof i18n.__, defectId: string): InvalidDefectIdError => ({
  _tag: "InvalidDefectIdError",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.DEFECT_ID"),
    value: defectId,
  }),
})
