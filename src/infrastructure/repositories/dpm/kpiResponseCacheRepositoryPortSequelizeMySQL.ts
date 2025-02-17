// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { QueryTypes, Sequelize, Transaction } from "sequelize"
import { KpiResponseCacheRepositoryPort } from "../../../application/port/repositories/dpm/KpiResponseCacheRepositoryPort.js"
import { Kpi002Json } from "../../../domain/models/dpm/Kpi002Json.js"
import { DATE_CONST } from "../../../config/dpm/constant.js"

export const kpiResponseCacheRepositorySequelizeMySQL = async (
  sequelize: Sequelize,
): Promise<KpiResponseCacheRepositoryPort<Transaction>> => ({
  wrapInWorkUnitCtx: async (fn) => {
    return sequelize.transaction(fn)
  },
  saveKpi002JsonCache: async (plantCode, unitCode, kpi002Json, lastTriggered, transaction) => {
    const query = `
      INSERT INTO T_KPI002_RESPONSE_CACHE (PLANT_CODE, UNIT_CODE, RESPONSE_JSON, LAST_TRIGGERED)
      VALUES (:plantCode, :unitCode, :kpi002Json, :lastTriggered)
      ON DUPLICATE KEY UPDATE RESPONSE_JSON=:kpi002Json, LAST_TRIGGERED=:lastTriggered;
    `
    await sequelize.query(query, {
      type: QueryTypes.UPSERT,
      raw: true,
      transaction,
      replacements: {
        plantCode,
        unitCode,
        kpi002Json: JSON.stringify(kpi002Json),
        lastTriggered: lastTriggered.toUTC().toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      },
    })
  },
  getKpi002JsonCache: async (plantCode, unitCode, noOlderThan, transaction) => {
    const query = `
      SELECT RESPONSE_JSON
      FROM T_KPI002_RESPONSE_CACHE
      WHERE
        PLANT_CODE=:plantCode
        AND UNIT_CODE=:unitCode
        AND LAST_TRIGGERED > :noOlderThan
      FOR UPDATE;
    `
    const result = await sequelize.query<{ RESPONSE_JSON: Kpi002Json }>(query, {
      type: QueryTypes.SELECT,
      plain: true,
      raw: true,
      transaction,
      replacements: {
        plantCode,
        unitCode,
        noOlderThan: noOlderThan.toUTC().toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      },
    })
    return result === null ? null : result.RESPONSE_JSON
  },
  saveCommonJsonCache: async (plantCode, unitCode, epochTimestamp, measure, CacheJson, lastTriggered, transaction) => {
    const query = `
      INSERT INTO T_KPI003_RESPONSE_CACHE (PLANT_CODE, UNIT_CODE, EPOCH_SECONDS,MEASURE , RESPONSE_JSON, LAST_TRIGGERED)
      VALUES (:plantCode, :unitCode, :epochTimestamp,:measure , :CacheJson, :lastTriggered)
      ON DUPLICATE KEY UPDATE RESPONSE_JSON=:CacheJson, LAST_TRIGGERED=:lastTriggered , MEASURE=:measure;
    `
    await sequelize.query(query, {
      type: QueryTypes.UPSERT,
      raw: true,
      logging: false,
      transaction,
      replacements: {
        plantCode,
        unitCode,
        epochTimestamp,
        measure,
        CacheJson: JSON.stringify(CacheJson),
        lastTriggered: lastTriggered.toUTC().toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      },
    })
  },
  getCommonJsonCache: async (plantCode, unitCode, epochTimestamp, measure, noOlderThan, transaction) => {
    const query = `
      SELECT RESPONSE_JSON
      FROM T_KPI003_RESPONSE_CACHE
      WHERE
        PLANT_CODE=:plantCode
        AND UNIT_CODE=:unitCode
        AND EPOCH_SECONDS=:epochTimestamp
        AND MEASURE= :measure
        AND LAST_TRIGGERED > :noOlderThan
      FOR UPDATE;
    `
    const result = await sequelize.query<{ RESPONSE_JSON: any }>(query, {
      type: QueryTypes.SELECT,
      plain: true,
      raw: true,
      transaction,
      replacements: {
        plantCode,
        unitCode,
        epochTimestamp,
        measure,
        noOlderThan: noOlderThan.toUTC().toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      },
    })
    return result ? result.RESPONSE_JSON : null
  },
  cleanKpi003ResponseCacheBeforeLastTriggered: async (noOlderThan, transaction) => {
    const query = `DELETE FROM T_KPI003_RESPONSE_CACHE WHERE LAST_TRIGGERED < :noOlderThan ;`
    await sequelize.query(query, {
      replacements: {
        noOlderThan: noOlderThan.toFormat(DATE_CONST.YYYY_MM_DD_HH_MM_SS_SSS),
      },
      transaction,
    })
  },
})
