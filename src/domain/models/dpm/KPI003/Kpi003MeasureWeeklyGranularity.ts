// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { _FrequencyEntry } from "./Kpi003MeasureDataSeries.js"

// _weeklySeries type represents a weekly data series. Each entry in the array represents a day of the week.
export type _weeklySeries = [
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
  null | number,
]

// _weeklyPeriod type represents a weekly data period.
export type _weeklyPeriod = [string, string, string, string, string, string, string]

// _weeklyEntry is a FrequencyEntry with an weekly data series and an weekly period.
export type _weeklyEntry = _FrequencyEntry<_weeklySeries, _weeklyPeriod>

// _weekly has an object type with properties Prefix, Suffix, and entries '1' through '52', each of which is an _weeklyEntry.
export type _weekly<prefix, suffix> = {
  Prefix: prefix
  Suffix: suffix
  "1": _weeklyEntry
  "2": _weeklyEntry
  "3": _weeklyEntry
  "4": _weeklyEntry
  "5": _weeklyEntry
  "6": _weeklyEntry
  "7": _weeklyEntry
  "8": _weeklyEntry
  "9": _weeklyEntry
  "10": _weeklyEntry
  "11": _weeklyEntry
  "12": _weeklyEntry
  "13": _weeklyEntry
  "14": _weeklyEntry
  "15": _weeklyEntry
  "16": _weeklyEntry
  "17": _weeklyEntry
  "18": _weeklyEntry
  "19": _weeklyEntry
  "20": _weeklyEntry
  "21": _weeklyEntry
  "22": _weeklyEntry
  "23": _weeklyEntry
  "24": _weeklyEntry
  "25": _weeklyEntry
  "26": _weeklyEntry
  "27": _weeklyEntry
  "28": _weeklyEntry
  "29": _weeklyEntry
  "30": _weeklyEntry
  "31": _weeklyEntry
  "32": _weeklyEntry
  "33": _weeklyEntry
  "34": _weeklyEntry
  "35": _weeklyEntry
  "36": _weeklyEntry
  "37": _weeklyEntry
  "38": _weeklyEntry
  "39": _weeklyEntry
  "40": _weeklyEntry
  "41": _weeklyEntry
  "42": _weeklyEntry
  "43": _weeklyEntry
  "44": _weeklyEntry
  "45": _weeklyEntry
  "46": _weeklyEntry
  "47": _weeklyEntry
  "48": _weeklyEntry
  "49": _weeklyEntry
  "50": _weeklyEntry
  "51": _weeklyEntry
  "52": _weeklyEntry
}
