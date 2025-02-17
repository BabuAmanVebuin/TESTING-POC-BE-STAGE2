// Imported from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
const optionalLoadAsBoolean = (index: string, defaultval: boolean): boolean => {
  if (process.env[index] === undefined) {
    return defaultval
  }
  return process.env[index] === "true"
}

const loadAsString = (index: string, required = true): string | undefined => {
  const value: string | undefined = process.env[index]
  if (value === undefined && required) throw new Error(index + " must be set!")
  return value
}

const loadAsNumber = (index: string, required = true): number | undefined => {
  const value: string | undefined = process.env[index]
  if (value === undefined && !required) {
    return value
  }
  const asNumber = Number(value)
  if (value === undefined || isNaN(asNumber)) throw new Error(index + " must be set as number!")
  return asNumber
}

export const env = {
  APPSERVER_PORT: loadAsNumber("APPSERVER_PORT"),
  LOCAL: optionalLoadAsBoolean("LOCAL", false),
  CRON_MODE: loadAsString("CRON_MODE", false) || "js",
  // DPM database env variables
  DB_NAME: loadAsString("DB_NAME"),
  DB_HOST: loadAsString("DB_HOST"),
  DB_PWD: loadAsString("DB_PWD"),
  DB_PORT: loadAsNumber("DB_PORT"),
  DB_USER: loadAsString("DB_USER"),

  // dcd database env variables
  CMN_DB_NAME: loadAsString("CMN_DB_NAME"),
  CMN_DB_HOST: loadAsString("CMN_DB_HOST"),
  CMN_DB_PWD: loadAsString("CMN_DB_PWD"),
  CMN_DB_PORT: loadAsNumber("CMN_DB_PORT"),
  CMN_DB_USER: loadAsString("CMN_DB_USER"),

  // snowflack
  SNOWFLAKE_ACCOUNT: loadAsString("SNOWFLAKE_ACCOUNT") || "",
  SNOWFLAKE_USERNAME: loadAsString("SNOWFLAKE_USERNAME") || "",
  SNOWFLAKE_PASSWORD: loadAsString("SNOWFLAKE_PASSWORD"),
  SNOWFLAKE_WAREHOUSE: loadAsString("SNOWFLAKE_WAREHOUSE"),
  SNOWFLAKE_DATABASE: loadAsString("SNOWFLAKE_DATABASE"),
  SNOWFLAKE_APPLICATION: loadAsString("SNOWFLAKE_APPLICATION"),
  SNOWFLAKE_ROLE: loadAsString("SNOWFLAKE_ROLE"),

  SSL_CERT: loadAsString("SSL_CERT", false),
  TIMEZONE: loadAsString("TIMEZONE", false) || "Asia/Tokyo",
  KPI003_YEAR_HALF_RANGE: loadAsNumber("KPI003_YEAR_HALF_RANGE", false) || 20,
  KPI003_MONTH_HALF_RANGE: loadAsNumber("KPI003_MONTH_HALF_RANGE", false) || 18,
  KPI003_WEEK_HALF_RANGE: loadAsNumber("KPI003_WEEK_HALF_RANGE", false) || 26,
  KPI003_DAY_HALF_RANGE: loadAsNumber("KPI003_DAY_HALF_RANGE", false) || 45,
  KPI003_NO_OLDER_THAN_HOUR: loadAsNumber("KPI003_NO_OLDER_THAN", false) || 1,
  LOG_LEVEL: loadAsString("LOG_LEVEL", false) || "debug",

  // Event hub
  CONSUMER_GROUP: loadAsString("CONSUMER_GROUP", false),
  EVH_SA_CONNECTION_STRING: loadAsString("EVH_SA_CONNECTION_STRING", true) || "",
  //  Maintenance plan Defect Event Hub
  EVH_MAINTENANCE_DEFECT_TOPIC: loadAsString("EVH_MAINTENANCE_DEFECT_TOPIC", true) || "",
  EVH_MAINTENANCE_DEFECT_CONNECTION_STRING: loadAsString("EVH_MAINTENANCE_DEFECT_CONNECTION_STRING", true) || "",
  CHECKPOINT_MAINTENANCE_DEFECT_CONTAINER_NAME:
    loadAsString("CHECKPOINT_MAINTENANCE_DEFECT_CONTAINER_NAME", true) || "",
  //  Maintenance plan Event Hub
  EVH_MAINTENANCE_PLAN_TOPIC: loadAsString("EVH_MAINTENANCE_PLAN_TOPIC", true) || "",
  EVH_MAINTENANCE_PLAN_CONNECTION_STRING: loadAsString("EVH_MAINTENANCE_PLAN_CONNECTION_STRING", true) || "",
  CHECKPOINT_MAINTENANCE_PLAN_CONTAINER_NAME: loadAsString("CHECKPOINT_MAINTENANCE_PLAN_CONTAINER_NAME", true) || "",
  RUN_SCHEDULED_TASKS: optionalLoadAsBoolean("RUN_SCHEDULED_TASKS", true),
}
