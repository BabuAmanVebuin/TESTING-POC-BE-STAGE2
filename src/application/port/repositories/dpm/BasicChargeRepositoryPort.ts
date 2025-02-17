// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime } from "luxon"

export type BasicChargeRepositoryPort = {
  getBasicCharge: (
    plantCode: string,
    unitCode: string | null,
    start: DateTime,
    length: number,
  ) => Promise<{ Annual: number | null; Monthly: number | null; FiscalYear: number }[]>
}
