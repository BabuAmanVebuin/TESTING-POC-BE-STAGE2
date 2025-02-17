// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { _FrequencyEntry } from "./Kpi003MeasureDataSeries.js"

// _monthlySeries type represents a monthly data series. Each entry in the array represents a day of the month.
export type _monthlySeries = [
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
]

// _monthlyPeriod type represents a monthly data period.
export type _monthlyPeriod = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string | null,
  string | null,
  string | null,
]

// _monthlyEntry is a FrequencyEntry with an monthly data series and an monthly period.
export type _monthlyEntry = _FrequencyEntry<_monthlySeries, _monthlyPeriod>

// _monthly type represents a monthly data series.
export type _monthly<prefix, suffix> = {
  Prefix: prefix
  Suffix: suffix
  "1": _monthlyEntry
  "2": _monthlyEntry
  "3": _monthlyEntry
  "4": _monthlyEntry
  "5": _monthlyEntry
  "6": _monthlyEntry
  "7": _monthlyEntry
  "8": _monthlyEntry
  "9": _monthlyEntry
  "10": _monthlyEntry
  "11": _monthlyEntry
  "12": _monthlyEntry
  "13": _monthlyEntry
  "14": _monthlyEntry
  "15": _monthlyEntry
  "16": _monthlyEntry
  "17": _monthlyEntry
  "18": _monthlyEntry
  "19": _monthlyEntry
  "20": _monthlyEntry
  "21": _monthlyEntry
  "22": _monthlyEntry
  "23": _monthlyEntry
  "24": _monthlyEntry
  "25": _monthlyEntry
  "26": _monthlyEntry
  "27": _monthlyEntry
  "28": _monthlyEntry
  "29": _monthlyEntry
  "30": _monthlyEntry
  "31": _monthlyEntry
  "32": _monthlyEntry
  "33": _monthlyEntry
  "34": _monthlyEntry
  "35": _monthlyEntry
  "36": _monthlyEntry
}
