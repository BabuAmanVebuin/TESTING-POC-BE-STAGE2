export const setLimitAndOffset = (query: string, input: { offset?: number; limit?: number }) => {
  if (input.offset !== undefined) {
    return `${query} LIMIT :offset, :limit`
  }
  if (input.limit !== undefined) {
    return `${query} LIMIT :limit`
  }
  return query
}
