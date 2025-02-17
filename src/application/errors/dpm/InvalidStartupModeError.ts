// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidStartupModeError = {
  readonly _tag: "InvalidStartupMode"
  readonly message: string
}

export const invalidStartupModeError = (t: typeof i18n.__, startupMode: string): InvalidStartupModeError => ({
  _tag: "InvalidStartupMode",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.STARTUP_MODE"),
    value: startupMode,
  }),
})
