// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { DateTime, Duration } from "luxon"
import { Kpi002Json, kpi } from "../../../../domain/models/dpm/Kpi002Json.js"
import { SnowflakeTransaction, snowflakeSelectWrapper } from "../../../orm/snowflake/index.js"
import {
  Kpi003SubcacheFetchResult,
  Kpi003SubcacheMinimalRow,
  TableForecastType,
  UnscaledEstimates,
} from "../../../../domain/models/dpm/Kpi003Cache.js"
import { env } from "../../../env/dpm/index.js"
import { Kpi003RepositoryPort } from "../../../../application/port/repositories/dpm/Kpi003RepositoryPort.js"
import { DATE_CONST } from "../../../../config/dpm/constant.js"

const mysqlYearWeekMode5 = (d: DateTime) => {
  // A week starts with Monday.
  // Week 1 the full first week with a Monday in this year
  let currentYear = d.year

  // Check how many days are in the partial week at the start of the year:
  const yearStart = d.set({
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  // weekday starts at 1 for Monday and ends at 7 for Sunday in luxon;
  const missingDays = yearStart.weekday - 1
  const partialWeekdays = (7 - missingDays) % 7

  // What's the week number?
  let weeknumber = Math.ceil(Math.max(0, d.ordinal - partialWeekdays) / 7)

  // If we're in week "0", we need to change it to be the last week of the previous year
  if (weeknumber === 0) {
    const lastYearStart = DateTime.local(currentYear - 1, 1, 1, 0, 0, 0, 0, {
      zone: env.TIMEZONE,
    })
    currentYear = currentYear - 1

    // Was last year a leap year?
    if (lastYearStart.isInLeapYear) {
      // Ok, so last year had 366 days, that means if the first day of last year was either a
      // Sunday or a Monday, then are currently in the 53rd week of last year.
      // Otherwise we're only in week 52 of last year.
      weeknumber = [1, 7].includes(lastYearStart.weekday) ? 53 : 52
    } else {
      // Last year had 365 days, that means we're in week 53 iff last year started on a Monday
      weeknumber = lastYearStart.weekday === 1 ? 53 : 52
    }
  }

  return currentYear * 100 + weeknumber
}

const timescaleConfigs: Record<
  "annual" | "monthly" | "weekly" | "daily",
  {
    timeColumnName: string
  }
> = {
  weekly: {
    timeColumnName: "YEAR_WEEK",
  } as const,
  annual: {
    timeColumnName: "FISCAL_YEAR",
  } as const,
  monthly: {
    timeColumnName: "MONTH",
  } as const,
  daily: {
    timeColumnName: "DAY",
  } as const,
} as const

const getScopeAndScopeFilter = (unitCode: string | null) => {
  const scope = unitCode === null ? "plant" : "unit"
  const scopeFilter = unitCode === null ? "c.PLANT_CODE=:1" : "c.UNIT_CODE=:2"
  return [scope, scopeFilter]
}

const annualUnscaledEstimatesMapToArray = (map: Map<number, UnscaledEstimates>) => {
  return [...map].sort((a, b) => a[0] - b[0]).map((entry) => entry[1])
}

const createAnnualUnscaledEstimatesMap = (startingYear: number, length: number): Map<number, UnscaledEstimates> => {
  const unscaledEstimatesMap = new Map<number, UnscaledEstimates>()
  for (let x = 0; x < length; x += 1) {
    unscaledEstimatesMap.set(startingYear + x, {
      actual: null,
      forecast: null,
      planned: null,
    })
  }
  return unscaledEstimatesMap
}

const buildGetEstimatesQuery = (
  unitCode: string | null,
  measure: string,
  granularity: "annual" | "monthly" | "weekly" | "daily",
) => {
  const [scope, scopeFilter] = getScopeAndScopeFilter(unitCode)
  const tableName = `rfz_ope_and_mte.t_kpi003_${scope}_wise_${measure}_${granularity}_estimates`
  const config = timescaleConfigs[granularity]

  return `
    select
      *
    from
      ${tableName} c
    where
      ${scopeFilter}
      and c.${config.timeColumnName} >= :3
      and c.${config.timeColumnName} < :4
  `
}
const getEstimates = async (
  snowflakeTransaction: SnowflakeTransaction,
  plantCode: string,
  unitCode: string | null,
  measure: string,
  granularity: "annual" | "monthly" | "weekly" | "daily",
  start: DateTime,
  length: number,
) => {
  const query = buildGetEstimatesQuery(unitCode, measure, granularity)

  if (granularity === "annual") {
    // Build a map to hold our results:
    const firstFiscalYear = start.year
    const lastFiscalYear = firstFiscalYear + length
    const unscaledEstimatesMap = createAnnualUnscaledEstimatesMap(firstFiscalYear, length)

    const results = await snowflakeSelectWrapper<{
      FISCAL_YEAR: number
      PLANNED: number
      FORECAST: number
      ACTUAL: number
    }>(snowflakeTransaction, {
      sqlText: query,
      binds: [plantCode, unitCode || "", firstFiscalYear, lastFiscalYear],
    })

    for (const result of results) {
      unscaledEstimatesMap.set(result.FISCAL_YEAR, {
        actual: result.ACTUAL,
        forecast: result.FORECAST,
        planned: result.PLANNED,
      })
    }

    // Now we return the estimates map as a sorted array
    return annualUnscaledEstimatesMapToArray(unscaledEstimatesMap)
  }

  if (granularity === "monthly") {
    const durationBuilder = (i: number) => Duration.fromObject({ months: i })

    // Build a map to hold our results:
    const unscaledEstimatesMap = new Map<string, UnscaledEstimates>()
    const rangeStart = start
    const rangeEnd = start.plus(durationBuilder(length))
    for (let x = 0; x < length; x += 1) {
      const key = start.plus(durationBuilder(x)).toFormat(DATE_CONST.KEY_FORMAT_KPI003)
      unscaledEstimatesMap.set(key, {
        actual: null,
        forecast: null,
        planned: null,
      })
    }

    const results = await snowflakeSelectWrapper<{
      MONTH: Date
      ACTUAL: number
      FORECAST: number
      PLANNED: number
    }>(snowflakeTransaction, {
      sqlText: query,
      binds: [
        plantCode,
        unitCode || "",
        rangeStart.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
        rangeEnd.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      ],
    })
    for (const result of results) {
      const key = DateTime.fromJSDate(result.MONTH).setZone(env.TIMEZONE).toFormat(DATE_CONST.KEY_FORMAT_KPI003)
      unscaledEstimatesMap.set(key, {
        actual: result.ACTUAL,
        forecast: result.FORECAST,
        planned: result.PLANNED,
      })
    }

    return [...unscaledEstimatesMap].sort((a, b) => (a[0] < b[0] ? -1 : 0)).map((entry) => entry[1])
  }
  if (granularity === "weekly") {
    const durationBuilder = (i: number) => Duration.fromObject({ weeks: i })

    // Build a map to hold our results:
    const unscaledEstimatesMap = new Map<number, UnscaledEstimates>()
    const rangeStart = mysqlYearWeekMode5(start)
    const rangeEnd = mysqlYearWeekMode5(start.plus(durationBuilder(length)))
    for (let x = 0; x < length; x += 1) {
      const key = mysqlYearWeekMode5(start.plus(durationBuilder(x)))
      unscaledEstimatesMap.set(key, {
        actual: null,
        forecast: null,
        planned: null,
      })
    }

    const results = await snowflakeSelectWrapper<{
      YEAR_WEEK: number
      PLANNED: number
      FORECAST: number
      ACTUAL: number
    }>(snowflakeTransaction, {
      sqlText: query,
      binds: [plantCode, unitCode || "", rangeStart, rangeEnd],
    })
    for (const result of results) {
      unscaledEstimatesMap.set(result.YEAR_WEEK, {
        actual: result.ACTUAL,
        planned: result.PLANNED,
        forecast: result.FORECAST,
      })
    }

    return [...unscaledEstimatesMap].sort((a, b) => a[0] - b[0]).map((entry) => entry[1])
  }

  // Must be daily if we arrive here
  const durationBuilder = (i: number) => Duration.fromObject({ day: i })

  // Build a map to hold our results:
  const unscaledEstimatesMap = new Map<string, UnscaledEstimates>()
  const rangeStart = start
  const rangeEnd = start.plus(durationBuilder(length))
  for (let x = 0; x < length; x += 1) {
    const key = start.plus(durationBuilder(x)).toFormat(DATE_CONST.KEY_FORMAT_KPI003)
    unscaledEstimatesMap.set(key, {
      actual: null,
      forecast: null,
      planned: null,
    })
  }

  const results = await snowflakeSelectWrapper<{
    DAY: Date
    ACTUAL: number
    FORECAST: number
    PLANNED: number
  }>(snowflakeTransaction, {
    sqlText: query,
    binds: [
      plantCode,
      unitCode || "",
      rangeStart.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      rangeEnd.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
    ],
  })
  for (const result of results) {
    const key = DateTime.fromJSDate(result.DAY).setZone(env.TIMEZONE).toFormat(DATE_CONST.KEY_FORMAT_KPI003)
    unscaledEstimatesMap.set(key, {
      actual: result.ACTUAL,
      forecast: result.FORECAST,
      planned: result.PLANNED,
    })
  }

  // Now we return the estimates map as a sorted array
  return [...unscaledEstimatesMap].sort((a, b) => (a[0] < b[0] ? -1 : 0)).map((entry) => entry[1])
}

export const kpi003RepositorySnowflake = async (
  snowflakeTransaction: SnowflakeTransaction,
): Promise<Kpi003RepositoryPort> => {
  return {
    getPastAnnualTotalGrossMarginCache: async (plantCode, unitCode, currentFiscalYear) => {
      const query =
        unitCode === null
          ? `
        SELECT
          k.FISCAL_YEAR,
          first_value(c.VALUE) over (partition by k.FISCAL_YEAR order by c.START_DATETIME desc) as GROSS_MARGIN
        FROM
          rfz_ope_and_mte.t_kpi003_plant_wise_actual_or_forecast_subcache c
          join (
            select distinct
              FISCAL_YEAR,
              MONTH
            from rfz_ope_and_mte.t_kpi_facts
            where
              FISCAL_YEAR < :3
          ) k on
            c.START_DATETIME=k.MONTH
        WHERE
          c.PLANT_CODE = :1
          AND c.MEASURE='GrossMargin'
          AND c.GRANULARITY='MONTH_CUMULATIVE'
      `
          : `
        SELECT
          k.FISCAL_YEAR,
          first_value(c.VALUE) over (partition by k.FISCAL_YEAR order by c.START_DATETIME desc) as GROSS_MARGIN
        FROM
         rfz_ope_and_mte.t_kpi003_unit_wise_actual_or_forecast_subcache c
          join (
            select distinct
              FISCAL_YEAR,
              MONTH
            from rfz_ope_and_mte.t_kpi_facts
            where
              FISCAL_YEAR < :3
          ) k on
            c.START_DATETIME=k.MONTH
        WHERE
          c.UNIT_CODE= :2
          AND c.MEASURE='GrossMargin'
          AND c.GRANULARITY='MONTH_CUMULATIVE'
  
      `
      const results = await snowflakeSelectWrapper<{
        FISCAL_YEAR: number
        GROSS_MARGIN: number
      }>(snowflakeTransaction, {
        sqlText: query,
        binds: [plantCode, unitCode || "", currentFiscalYear],
      })
      return new Map(results.map((row) => [Number(row.FISCAL_YEAR), Math.floor(row.GROSS_MARGIN / 100_000_000)]))
    },
    getKpi002Data: async (plantCode, unitCode, fiscalYear) => {
      const KPI: kpi = {
        OPEXOperation: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        OPEXMaintenance: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        OPEXTotal: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        BasicCharge: {
          Annual: null,
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
        },
        BasicProfit: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        EBITDA: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        GrossMargin: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        GenerationOutput: {
          Prefix: null,
          Suffix: "GWh",
          Suffix2: null,
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        Availability: {
          Prefix: null,
          Suffix: "%",
          Suffix2: null,
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        Spread: {
          Prefix: null,
          Suffix: "YEN/KWh",
          Suffix2: null,
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        ThermalEfficiency: {
          Prefix: null,
          Suffix: "%",
          Suffix2: null,
          Forecast: 0,
          Plan: 0,
          Actual: 0,
        },
        AnnualTotalGrossMargin: {
          Prefix: "¥",
          Suffix: "Oku",
          Suffix2: "Oku",
          data: {},
        },
      }

      const kpi002Json: Kpi002Json = {
        Type: unitCode ? "Generator" : "Plant",
        Name: unitCode || plantCode,
        KPI,
      }

      const scopeFilter = unitCode ? "c.UNIT_CODE= :2" : "c.PLANT_CODE= :1"
      const scope = unitCode ? "unit" : "plant"

      const query1 = `
          select distinct
            MEASURE as "MEASURE" ,
            first_value(FORECAST_CATEGORY) over (partition by MEASURE order by START_DATETIME DESC) as "FORECAST_CATEGORY",
            first_value(VALUE) over (partition by MEASURE order by START_DATETIME desc) as "VALUE"
          from
            rfz_ope_and_mte.t_kpi003_${scope}_wise_actual_or_forecast_subcache c
          where
            c.GRANULARITY='MONTH_CUMULATIVE'
            and c.MEASURE in ('OperationCost','MaintenanceCost', 'OPEX', 'BasicProfit','EBITDA','GrossMargin','GenerationOutput','Availability','Spread','ThermalEfficiency')
            and ${scopeFilter} and
            c.START_DATETIME in (
              select distinct
                MONTH
              from
              rfz_ope_and_mte.t_kpi_facts
              where
              FISCAL_YEAR = :3
            );
            `
      const results1 = await snowflakeSelectWrapper<{
        MEASURE:
          | "OperationCost"
          | "MaintenanceCost"
          | "OPEX"
          | "BasicProfit"
          | "EBITDA"
          | "GrossMargin"
          | "GenerationOutput"
          | "Availability"
          | "Spread"
          | "ThermalEfficiency"
          | "BasicProfit"
        FORECAST_CATEGORY: "Forecast" | "Actual"
        VALUE: number
      }>(snowflakeTransaction, {
        sqlText: query1,
        binds: [plantCode, unitCode || "", fiscalYear],
      })

      const opexConversion = (x: number) => Math.floor(x / 100_000_000)
      const outputConversion = (x: number) => Math.floor(x / 1_000)
      const measureMap = {
        OperationCost: {
          key: "OPEXOperation",
          convert: opexConversion,
        },
        MaintenanceCost: {
          key: "OPEXMaintenance",
          convert: opexConversion,
        },
        OPEX: {
          key: "OPEXTotal",
          convert: opexConversion,
        },
        BasicProfit: {
          key: "BasicProfit",
          convert: opexConversion,
        },
        EBITDA: {
          key: "EBITDA",
          convert: opexConversion,
        },
        GrossMargin: {
          key: "GrossMargin",
          convert: opexConversion,
        },
        GenerationOutput: {
          key: "GenerationOutput",
          convert: outputConversion,
        },
        Availability: {
          key: "Availability",
          convert: (x: number) => Math.round(x * 1000) / 10,
        },
        Spread: {
          key: "Spread",
          convert: (x: number) => Math.floor(x * 10) / 10,
        },
        ThermalEfficiency: {
          key: "ThermalEfficiency",
          convert: (x: number) => Math.round(x * 10000) / 100,
        },
      } as const

      for (const result of results1) {
        if (result.FORECAST_CATEGORY === "Forecast") {
          const map = measureMap[result.MEASURE]
          KPI[map.key].Forecast = map.convert(result.VALUE)
        }
      }

      for (const [x, m] of Object.entries(measureMap)) {
        const tableName = `rfz_ope_and_mte.t_kpi003_${scope}_wise_${x}_annual_estimates`
        const query = `
            select
              PLANNED,
              ACTUAL
            from ${tableName} c
            where
              ${scopeFilter} and FISCAL_YEAR=:3;
          `
        const result = await snowflakeSelectWrapper<{
          PLANNED: number
          ACTUAL: number
        }>(snowflakeTransaction, {
          sqlText: query,
          binds: [plantCode, unitCode || "", fiscalYear],
        })
        if (result[0]) {
          KPI[m.key].Plan = m.convert(result[0].PLANNED)
          KPI[m.key].Actual = m.convert(result[0].ACTUAL)
        }
      }
      const getBasicChargesSQL = `
          SELECT
            SUM(IFNULL(c.OPERATION_AMOUNT, 0) + IFNULL(c.MAINTENANCE_AMOUNT, 0)) as "basicCharge"
          FROM rfz_ope_and_mte.dm_v_basic_charge_forecast c
            WHERE ${scopeFilter} and c.FISCAL_YEAR =:3`

      const basicChargesResult = await snowflakeSelectWrapper<{
        basicCharge: number
      }>(snowflakeTransaction, {
        sqlText: getBasicChargesSQL,
        binds: [plantCode, unitCode || "", fiscalYear],
      })

      if (basicChargesResult[0]) {
        kpi002Json.KPI.BasicCharge.Annual = Math.round(basicChargesResult[0].basicCharge * 100) / 100
      }

      return kpi002Json
    },
    getKpi003SubcacheRows: async (
      plantCode,
      unitCode,
      monthlyStart,
      monthlyEnd,
      dailyStart,
      dailyEnd,
      hourlyStart,
      hourlyEnd,
      measure,
      forecastCategory: TableForecastType,
    ) => {
      const returnValues: Kpi003SubcacheFetchResult = {
        cumulativeMonthly: [],
        monthly: [],
        daily: [],
        hourly: [],
      }

      let scopeFilter: string
      let table: string
      const rowForecast = forecastCategory === "planned" ? `'Planned' AS FORECAST_CATEGORY` : "FORECAST_CATEGORY"
      if (unitCode === null) {
        scopeFilter = `PLANT_CODE=:1`
        table = `rfz_ope_and_mte.t_kpi003_plant_wise_${forecastCategory}_subcache`
      } else {
        scopeFilter = `UNIT_CODE=:2`
        table = `rfz_ope_and_mte.t_kpi003_unit_wise_${forecastCategory}_subcache`
      }

      const query = `
        SELECT
          start_datetime AS "START",
          ${rowForecast},
          VALUE
        FROM
          ${table}
        WHERE
          ${scopeFilter}
          AND MEASURE=:3
          AND GRANULARITY=:4
          AND start_datetime >= :5
          AND start_datetime < :6
      `
      const binds = [
        plantCode,
        unitCode || "",
        measure,
        "MONTH",
        monthlyStart.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
        monthlyEnd.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      ]

      returnValues.monthly = await snowflakeSelectWrapper<Kpi003SubcacheMinimalRow>(snowflakeTransaction, {
        sqlText: query,
        binds,
      })

      binds[3] = "MONTH_CUMULATIVE"
      returnValues.cumulativeMonthly = await snowflakeSelectWrapper<Kpi003SubcacheMinimalRow>(snowflakeTransaction, {
        sqlText: query,
        binds,
      })

      binds[3] = "DAY"
      binds[4] = dailyStart.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS)
      binds[5] = dailyEnd.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS)
      returnValues.daily = await snowflakeSelectWrapper<Kpi003SubcacheMinimalRow>(snowflakeTransaction, {
        sqlText: query,
        binds,
      })

      binds[3] = "HOUR"
      binds[4] = hourlyStart.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS)
      binds[5] = hourlyEnd.setZone(env.TIMEZONE).toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS)
      returnValues.hourly = await snowflakeSelectWrapper<Kpi003SubcacheMinimalRow>(snowflakeTransaction, {
        sqlText: query,
        binds,
      })

      return returnValues
    },
    getAvailabilityEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "Availability", granularity, start, length)
    },
    getEBITDAEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "EBITDA", granularity, start, length)
    },
    getGenerationOutputEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "GenerationOutput", granularity, start, length)
    },
    getGrossMarginEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "GrossMargin", granularity, start, length)
    },
    getGrossMarginMarketEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "GrossMarginMarket", granularity, start, length)
    },
    getGrossMarginPPAEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "GrossMarginPPA", granularity, start, length)
    },
    getHeatRateEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "HeatRate", granularity, start, length)
    },
    getMaintenanceCostEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "MaintenanceCost", granularity, start, length)
    },
    getBasicProfitCostEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "BasicProfit", granularity, start, length)
    },
    getOPEXEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "OPEX", granularity, start, length)
    },
    getOperationCostEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "OperationCost", granularity, start, length)
    },
    getSpreadEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "Spread", granularity, start, length)
    },
    getSpreadMarketEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "SpreadMarket", granularity, start, length)
    },
    getSpreadPPAEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "SpreadPPA", granularity, start, length)
    },
    getThermalEfficiencyEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "ThermalEfficiency", granularity, start, length)
    },
    getSalesUnitPriceEstimates: async (plantCode, unitCode, granularity, start, length) => {
      return getEstimates(snowflakeTransaction, plantCode, unitCode, "SalesUnitPrice", granularity, start, length)
    },
    getKpi003PlantWiseYearEndActualOrForecastValue: async (plantCode, measure, fiscalYear) => {
      const query = `
        select distinct
          (first_value(c.FORECAST_CATEGORY) over (order by c.start_datetime desc)) as FORECAST_CATEGORY,
          (first_value(c.VALUE) over (order by c.start_datetime desc)) as "value"
        from
          rfz_ope_and_mte.t_kpi003_plant_wise_actual_or_forecast_subcache c
          join (
            select distinct
              FISCAL_YEAR,
              MONTH
            from
              rfz_ope_and_mte.t_kpi_facts
            where
              FISCAL_YEAR=:1
          ) k on
            c.start_datetime=k.MONTH
        where
          c.GRANULARITY='MONTH_CUMULATIVE'
          and c.PLANT_CODE=:2
          and c.MEASURE=:3;
      `
      const result = (
        await snowflakeSelectWrapper<{
          FORECAST_CATEGORY: "Actual" | "Forecast"
          value: number
        }>(snowflakeTransaction, {
          sqlText: query,
          binds: [fiscalYear, plantCode, measure],
        })
      )[0]

      if (!result) {
        return { FORECAST_CATEGORY: "Actual", value: 0 }
      }
      return result
    },
    getKpi003UnitWiseYearEndActualOrForecastValue: async (unitCode, measure, fiscalYear) => {
      const query = `
        select distinct
          (first_value(c.FORECAST_CATEGORY) over (order by c.start_datetime desc)) as FORECAST_CATEGORY,
          (first_value(c.VALUE) over (order by c.start_datetime desc)) as "value"
        from
          rfz_ope_and_mte.t_kpi003_unit_wise_actual_or_forecast_subcache c
          join (
            select distinct
              FISCAL_YEAR,
              MONTH
            from
              rfz_ope_and_mte.t_kpi_facts
            where
              FISCAL_YEAR=:1
          ) k on
            c.start_datetime=k.MONTH
        where
          c.GRANULARITY='MONTH_CUMULATIVE'
          and c.UNIT_CODE=:2
          and c.MEASURE=:3;
      `
      const result = (
        await snowflakeSelectWrapper<{
          FORECAST_CATEGORY: "Actual" | "Forecast"
          value: number
        }>(snowflakeTransaction, {
          sqlText: query,
          binds: [fiscalYear, unitCode, measure],
        })
      )[0]

      if (!result) {
        return { FORECAST_CATEGORY: "Actual", value: 0 }
      }
      return result
    },
  }
}
export { Kpi003RepositoryPort }
