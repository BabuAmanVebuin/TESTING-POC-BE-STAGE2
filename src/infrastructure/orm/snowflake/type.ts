// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type sfDeleteType = { "number of rows deleted": number }
export type sfUpdateType = {
  "number of rows updated": number
  "number of multi-joined rows updated": number
}
export type sfInsertType = { "number of rows inserted": number }
