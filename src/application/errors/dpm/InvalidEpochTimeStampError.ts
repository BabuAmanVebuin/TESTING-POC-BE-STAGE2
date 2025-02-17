// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidEpochTimeStampError = {
  readonly _tag: "InvalidEpochTimeStampError"
  readonly message: string
}

export const invalidEpochTimeStampError = (t: typeof i18n.__, epochSeconds: unknown): InvalidEpochTimeStampError => ({
  _tag: "InvalidEpochTimeStampError",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.EPOCH_SECONDS"),
    value: String(epochSeconds),
  }),
})
