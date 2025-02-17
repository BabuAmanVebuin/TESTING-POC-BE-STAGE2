// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
//Estimates type for kpi003measure json
export type _Estimates = {
  Planned: number | null
  Actual: number | null
  Forecast: number | null
}

// _FrequencyEntry specifies the Estimates, Planned, Period, Forecast, and Actual data for a given dataSeries and period.
export type _FrequencyEntry<dataSeries extends (null | number)[], period extends (string | null)[]> = {
  Estimates: _Estimates
  Planned: dataSeries
  Period: period
  Forecast: dataSeries
  Actual: dataSeries
}
