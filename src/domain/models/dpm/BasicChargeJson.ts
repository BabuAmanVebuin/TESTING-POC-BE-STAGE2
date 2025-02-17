// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
//type for BasicCharge JSON
export type BasicChargeJson = {
  PlantCode: string
  UnitCode: string | null
  Prefix: string
  Suffix: string
  BasicCharge: {
    FiscalYear: number
    Annual: number | null
    Monthly: number | null
  }[]
}
