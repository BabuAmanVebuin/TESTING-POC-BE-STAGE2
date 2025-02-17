// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
// _annualSeries type represents an annual data series.

import { _FrequencyEntry } from "./Kpi003MeasureDataSeries.js"

// It specifies that the data series will have 12 entries for each month of the year, each of which may be null or a number.
export type _annualSeries = [
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

// _annualSeries type represents an annual data peroid.
export type _annualPeriod = [
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
]

// _annualEntry is a FrequencyEntry with an annual data series and an annual period.
export type _annualEntry = _FrequencyEntry<_annualSeries, _annualPeriod>

// It has an object type with properties Prefix, Suffix, and entries '1' through '10', each of which is an _annualEntry.
// The '1' through '10' entries are the data series for the 10 years of the decade.
export type _annual<prefix, suffix> = {
  Prefix: prefix
  Suffix: suffix
  "1": _annualEntry
  "2": _annualEntry
  "3": _annualEntry
  "4": _annualEntry
  "5": _annualEntry
  "6": _annualEntry
  "7": _annualEntry
  "8": _annualEntry
  "9": _annualEntry
  "10": _annualEntry
  "11": _annualEntry
  "12": _annualEntry
  "13": _annualEntry
  "14": _annualEntry
  "15": _annualEntry
  "16": _annualEntry
  "17": _annualEntry
  "18": _annualEntry
  "19": _annualEntry
  "20": _annualEntry
  "21": _annualEntry
  "22": _annualEntry
  "23": _annualEntry
  "24": _annualEntry
  "25": _annualEntry
  "26": _annualEntry
  "27": _annualEntry
  "28": _annualEntry
  "29": _annualEntry
  "30": _annualEntry
  "31": _annualEntry
  "32": _annualEntry
  "33": _annualEntry
  "34": _annualEntry
  "35": _annualEntry
  "36": _annualEntry
  "37": _annualEntry
  "38": _annualEntry
  "39": _annualEntry
  "40": _annualEntry
}
