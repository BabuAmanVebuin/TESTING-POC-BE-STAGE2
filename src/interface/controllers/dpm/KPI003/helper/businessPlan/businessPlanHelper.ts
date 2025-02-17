export const getFiscalYear = (targetDate: Date = new Date(), startMonth = 3): number => {
  if (startMonth <= targetDate.getMonth()) {
    return targetDate.getFullYear()
  } else {
    return targetDate.getFullYear() - 1
  }
}
export const currentFiscalYear = (startMonth = 3): number => getFiscalYear(undefined, startMonth)

export const toInt = (value: number, dotPosition: number): number => {
  const num = value * Math.pow(10, dotPosition)
  return Number(num.toFixed(0))
}

const asc = (a: number, b: number) => {
  return a - b
}

export const ascSort = (num: number[]): number[] => num.sort(asc)

export const fixedNumber = (num: number, fixedPosition = 10): number => Number(num.toFixed(fixedPosition))

export const filterByFiscalYear = <T extends { "fiscal-year": number }>(data: T[]): T[] =>
  data.filter((elem: T) => elem["fiscal-year"] > currentFiscalYear())
