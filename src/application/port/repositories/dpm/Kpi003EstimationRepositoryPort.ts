// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
export type Kpi003EstimationRepositoryPort<T> = {
  getEBITDAEstimates: <R extends Record<string, unknown>>(
    plantCode: string,
    unitCode: string | null,
    scope: "plant" | "unit",
    granularity: "annual",
    forecastCategory: string,
    workUnitCtx: T | null,
  ) => Promise<R[]>
  getGenerationOutputEstimates: <R extends Record<string, unknown>>(
    plantCode: string,
    unitCode: string | null,
    scope: "plant" | "unit",
    granularity: "annual",
    forecastCategory: string,
    workUnitCtx: T | null,
  ) => Promise<R[]>
}
