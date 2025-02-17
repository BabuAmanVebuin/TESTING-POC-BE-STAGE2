import fs from "fs"
import path from "path"

export const readSqlFile = (queryFile: string): string =>
  fs.readFileSync(path.resolve(`./src/interface/controllers/dpm/KPI003/sql/${queryFile}.sql`), {
    encoding: "utf8",
    flag: "r",
  })

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
