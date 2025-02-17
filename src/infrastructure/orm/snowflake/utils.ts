// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export const makeSnowflakeArrayBindingSpots = (startingNumber: number, count: number): string => {
  const arr = [...new Array(count)]
  return arr.map((_val, idx) => `:${idx + startingNumber}`).join(", ")
}

export const buildInParamsAsQuestions = (count: number): string => {
  const params = [] as string[]
  for (let i = 0; i < count; i++) {
    params.push(`?`)
  }
  return params.join(", ")
}

export const setLimitAndOffset = (query: string, input: { offset?: number; limit?: number }): string => {
  if (input.offset !== undefined) {
    if (input.offset < 0) {
      throw new Error("INVALID_OFFSET")
    }
    return `${query} LIMIT ? OFFSET ?`
  }
  if (input.limit !== undefined) {
    return `${query} LIMIT ?`
  }
  return query
}

export const setLimitAndOffsetBinds = (
  binds: (number | string)[],
  input: { offset?: number; limit?: number },
): (string | number)[] => {
  const ret = [...binds]
  if (input.limit !== undefined && input.offset !== undefined) {
    ret.push(input.limit)
    ret.push(input.offset)
  } else if (input.limit !== undefined) {
    ret.push(input.limit)
  }
  return ret
}
