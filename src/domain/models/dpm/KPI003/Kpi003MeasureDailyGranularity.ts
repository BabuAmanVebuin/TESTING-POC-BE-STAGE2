// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { _FrequencyEntry } from "./Kpi003MeasureDataSeries.js"

// _dailySeries type represents a daily data series.
export type _dailySeries = [
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

// _dailySeries type represents a daily data period.
export type _dailyPeriod = [
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
]

// _dailyEntry is a FrequencyEntry with an daily data series and an daily period.
export type _dailyEntry = _FrequencyEntry<_dailySeries, _dailyPeriod>

// _daily has an object type with properties Prefix, Suffix, and entries '1' through '90', each of which is an _dailyEntry.
export type _daily<prefix, suffix> = {
  Prefix: prefix
  Suffix: suffix
  "1": _dailyEntry
  "2": _dailyEntry
  "3": _dailyEntry
  "4": _dailyEntry
  "5": _dailyEntry
  "6": _dailyEntry
  "7": _dailyEntry
  "8": _dailyEntry
  "9": _dailyEntry
  "10": _dailyEntry
  "11": _dailyEntry
  "12": _dailyEntry
  "13": _dailyEntry
  "14": _dailyEntry
  "15": _dailyEntry
  "16": _dailyEntry
  "17": _dailyEntry
  "18": _dailyEntry
  "19": _dailyEntry
  "20": _dailyEntry
  "21": _dailyEntry
  "22": _dailyEntry
  "23": _dailyEntry
  "24": _dailyEntry
  "25": _dailyEntry
  "26": _dailyEntry
  "27": _dailyEntry
  "28": _dailyEntry
  "29": _dailyEntry
  "30": _dailyEntry
  "31": _dailyEntry
  "32": _dailyEntry
  "33": _dailyEntry
  "34": _dailyEntry
  "35": _dailyEntry
  "36": _dailyEntry
  "37": _dailyEntry
  "38": _dailyEntry
  "39": _dailyEntry
  "40": _dailyEntry
  "41": _dailyEntry
  "42": _dailyEntry
  "43": _dailyEntry
  "44": _dailyEntry
  "45": _dailyEntry
  "46": _dailyEntry
  "47": _dailyEntry
  "48": _dailyEntry
  "49": _dailyEntry
  "50": _dailyEntry
  "51": _dailyEntry
  "52": _dailyEntry
  "53": _dailyEntry
  "54": _dailyEntry
  "55": _dailyEntry
  "56": _dailyEntry
  "57": _dailyEntry
  "58": _dailyEntry
  "59": _dailyEntry
  "60": _dailyEntry
  "61": _dailyEntry
  "62": _dailyEntry
  "63": _dailyEntry
  "64": _dailyEntry
  "65": _dailyEntry
  "66": _dailyEntry
  "67": _dailyEntry
  "68": _dailyEntry
  "69": _dailyEntry
  "70": _dailyEntry
  "71": _dailyEntry
  "72": _dailyEntry
  "73": _dailyEntry
  "74": _dailyEntry
  "75": _dailyEntry
  "76": _dailyEntry
  "77": _dailyEntry
  "78": _dailyEntry
  "79": _dailyEntry
  "80": _dailyEntry
  "81": _dailyEntry
  "82": _dailyEntry
  "83": _dailyEntry
  "84": _dailyEntry
  "85": _dailyEntry
  "86": _dailyEntry
  "87": _dailyEntry
  "88": _dailyEntry
  "89": _dailyEntry
  "90": _dailyEntry
}
