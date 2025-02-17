// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type InvalidFiscalYearError = {
  readonly _tag: "InvalidFiscalYearError"
  readonly message: string
}

export const invalidFiscalYearError = (t: typeof i18n.__, fiscalYear: string): InvalidFiscalYearError => ({
  _tag: "InvalidFiscalYearError",
  message: t("ERROR.INVALID", {
    fieldName: t("FIELD.FISCAL_YEAR"),
    value: fiscalYear,
  }),
})
