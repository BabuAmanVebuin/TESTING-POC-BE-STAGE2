const optionalLoadAsBoolean = (index: string, defaultval: boolean): boolean => {
  let value: boolean | undefined = process.env[index] === "true"
  if (value === undefined) {
    value = defaultval
  }
  return value
}

const optionalLoadAsString = (index: string): string | undefined => {
  return process.env[index]
}

const loadAsString = (index: string): string => {
  const value: string | undefined = process.env[index]
  if (value === undefined) {
    throw new Error(`${index} must be set!`)
  }
  return value
}

const loadAsNumber = (index: string): number => {
  const value: string | undefined = process.env[index]
  const asNumber = Number(value)
  if (value === undefined || isNaN(asNumber)) {
    throw new Error(`${index} must be set as number!`)
  }
  return asNumber
}

export const env =
  process.env.RUNNING_UNIT_TESTS !== "1"
    ? {
        APPSERVER_PORT: loadAsNumber("APPSERVER_PORT"),
        DB_NAME: loadAsString("DB_NAME"),
        DB_HOST: loadAsString("DB_HOST"),
        DB_PWD: loadAsString("DB_PWD"),
        DB_PORT: loadAsNumber("DB_PORT"),
        DB_USER: loadAsString("DB_USER"),
        CMN_DB_NAME: loadAsString("CMN_DB_NAME"),
        CMN_DB_HOST: loadAsString("CMN_DB_HOST"),
        CMN_DB_PWD: loadAsString("CMN_DB_PWD"),
        CMN_DB_PORT: loadAsNumber("CMN_DB_PORT"),
        CMN_DB_USER: loadAsString("CMN_DB_USER"),
        SSL_CERT: optionalLoadAsString("SSL_CERT"),
        LOG_LEVEL: loadAsString("LOG_LEVEL"),
        DB_SSL_REQUIRED: optionalLoadAsBoolean("DB_SSL_REQUIRED", false),
        TIME_ZONE: optionalLoadAsString("TIME_ZONE") || "Asia/Tokyo",
        SNOWFLAKE_ACCOUNT: loadAsString("SNOWFLAKE_ACCOUNT"),
        SNOWFLAKE_USERNAME: loadAsString("SNOWFLAKE_USERNAME"),
        SNOWFLAKE_PASSWORD: loadAsString("SNOWFLAKE_PASSWORD"),
        SNOWFLAKE_WAREHOUSE: loadAsString("SNOWFLAKE_WAREHOUSE"),
        SNOWFLAKE_DATABASE: loadAsString("SNOWFLAKE_DATABASE"),
        SNOWFLAKE_APPLICATION: loadAsString("SNOWFLAKE_APPLICATION"),
        SNOWFLAKE_ROLE: loadAsString("SNOWFLAKE_ROLE"),
        EVH_MAINTENANCE_ORDER_CONNECTION_STRING: loadAsString("EVH_MAINTENANCE_ORDER_CONNECTION_STRING"),
        EVH_MAINTENANCE_ORDER_TOPIC: loadAsString("EVH_MAINTENANCE_ORDER_TOPIC"),
        EVH_SA_CONNECTION_STRING: loadAsString("EVH_SA_CONNECTION_STRING"),
        CHECKPOINT_MAINTENANCE_ORDER_CONTAINER_NAME: loadAsString("CHECKPOINT_MAINTENANCE_ORDER_CONTAINER_NAME"),
        CONSUMER_GROUP: loadAsString("CONSUMER_GROUP"),
        RECEIVE_EVENTS: optionalLoadAsBoolean("RECEIVE_EVENTS", true),
        ALLOW_API_CALL: optionalLoadAsBoolean("ALLOW_API_CALL", true),
      }
    : {
        APPSERVER_PORT: loadAsNumber("APPSERVER_PORT"),
        DB_NAME: loadAsString("DB_NAME_TEST"),
        DB_HOST: loadAsString("DB_HOST_TEST"),
        DB_PWD: loadAsString("DB_PWD_TEST"),
        DB_PORT: loadAsNumber("DB_PORT_TEST"),
        DB_USER: loadAsString("DB_USER_TEST"),
        CMN_DB_NAME: loadAsString("CMN_DB_NAME_TEST"),
        CMN_DB_HOST: loadAsString("CMN_DB_HOST_TEST"),
        CMN_DB_PWD: loadAsString("CMN_DB_PWD_TEST"),
        CMN_DB_PORT: loadAsNumber("CMN_DB_PORT_TEST"),
        CMN_DB_USER: loadAsString("CMN_DB_USER_TEST"),
        SSL_CERT: optionalLoadAsString("SSL_CERT"),
        LOG_LEVEL: loadAsString("LOG_LEVEL"),
        DB_SSL_REQUIRED: optionalLoadAsBoolean("DB_SSL_REQUIRED", false),
        TIME_ZONE: optionalLoadAsString("TIME_ZONE") || "Asia/Tokyo",
        SNOWFLAKE_ACCOUNT: loadAsString("SNOWFLAKE_ACCOUNT"),
        SNOWFLAKE_USERNAME: loadAsString("SNOWFLAKE_USERNAME"),
        SNOWFLAKE_PASSWORD: loadAsString("SNOWFLAKE_PASSWORD"),
        SNOWFLAKE_WAREHOUSE: loadAsString("SNOWFLAKE_WAREHOUSE"),
        SNOWFLAKE_DATABASE: loadAsString("SNOWFLAKE_DATABASE"),
        SNOWFLAKE_APPLICATION: loadAsString("SNOWFLAKE_APPLICATION"),
        SNOWFLAKE_ROLE: loadAsString("SNOWFLAKE_ROLE"),
        EVH_MAINTENANCE_ORDER_CONNECTION_STRING: loadAsString("EVH_MAINTENANCE_ORDER_CONNECTION_STRING"),
        EVH_MAINTENANCE_ORDER_TOPIC: loadAsString("EVH_MAINTENANCE_ORDER_TOPIC"),
        EVH_SA_CONNECTION_STRING: loadAsString("EVH_SA_CONNECTION_STRING"),
        CHECKPOINT_MAINTENANCE_ORDER_CONTAINER_NAME: loadAsString("CHECKPOINT_MAINTENANCE_ORDER_CONTAINER_NAME"),
        CONSUMER_GROUP: loadAsString("CONSUMER_GROUP"),
        RECEIVE_EVENTS: optionalLoadAsBoolean("RECEIVE_EVENTS", true),
        ALLOW_API_CALL: optionalLoadAsBoolean("ALLOW_API_CALL", true),
      }
