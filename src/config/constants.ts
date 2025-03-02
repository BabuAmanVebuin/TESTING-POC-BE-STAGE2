// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
export const Constants = {
  FIELDS: {
    POWER_PLANT_ID: "power-plant-id",
    POWER_PLANT_NAME: "power-plant-name",
    ASSET_TASK_GROUP_ID: "asset-task-group-id",
    TASK_ID: "task-id",
    TASK_TYPE_ID: "task-type-id",
    TASK_CATEGORY_ID: "task-category-id",
    TASK_NAME: "task-name",
    ASSET_ID: "asset-id",
    ASSET_CODE: "asset-code",
    PLANNED_DATE_TIME: "planned-date-time",
    TASK_PRIORITY_ID: "task-priority-id",
    DUE_DATE_TIME: "due-date-time",
    WORKING_HOURS: "working-hours",
    ESTIMATED_TASK_TIME: "estimated-task-time",
    TASK_STATUS_ID: "task-status-id",
    TAKEOVER_TEAM_ID: "takeover-team-id",
    REMARKS: "remarks",
    ORDER_ID: "order-id",
    EVENT_ID: "event-id",
    EVENT_NAME: "event-name",
    EVENT_TYPE_ID: "event-type-id",
    EVENT_TYPE_NAME: "event-type-name",
    OPERATE_USER_ID: "operate-user-id",
    START_DATE_TIME: "start-date-time",
    END_DATE_TIME: "end-date-time",
    SEARCH_UPPER_LIMIT: "search-upper-limit",
    PLANNED_DATE_TIME_TO: "planned-date-time-to",
    PLANNED_DATE_TIME_FROM: "planned-date-time-from",
    PLANNED_DATE_TIME_BLANK_FLAG: "planned-date-time-blank-flag",
    IS_CHAIN_MEMO_AVAILABLE: "is-chain-memo-available",
    TASK_TYPE_NAME: "task-type-name",
    TASK_CATEGORY_NAME: "task-category-name",
    ASSET_NAME: "asset-name",
    TASK_PRIORITY_NAME: "task-priority-name",
    CREATED_USER_ID: "create-user-id",
    UPDATED_USER_ID: "update-user-id",
    TAKEOVER_TEAM_NAME: "takeover-team-name",
    AUDIT_START_DATE_TIME: "audit-start-date-time",
    AUDIT_END_DATE_TIME: "audit-end-date-time",
    TEAM_ID: "team-id",
    TASK_EXECUTION_TIME: "task-execution-time",
    TASK_AUDIT_ID: "task-audit-id",
    PRE_TASK_STATUS_ID: "pre-task-status-id",
    POST_TASK_STATUS_ID: "post-task-status-id",
    OPERATE_TIMESTAMP: "operate-timestamp",
    TASK_STATUS_NAME: "task-status-name",
    CREATE_TIMESTAMP: "create-timestamp",
    UPDATE_TIMESTAMP: "update-timestamp",
    MONTH: "month",
    YEAR: "year",
    TOTAL_HOURS: "total-hours",
    TASK_FORECAST_ID: "task-forecast-id",
    TOTAL_TASKS: "total-tasks",
    END_DATE_TIME_FROM: "end-date-time-from",
    END_DATE_TIME_TO: "end-date-time-to",
    START_YEAR: "start-year",
    END_YEAR: "end-year",
    PAGE_NO: "page-no",
    PAGE_SEARCH_LIMIT: "page-search-limit",
    TASK_FORECAST: "task-forecast",
    TOTAL_PAGES: "total-pages",
    CURRENT_PAGE: "current-page",
    REQUESTED_BY: "requested-by",
    REQUEST: "request",
    STANDARD_TEXT_KEY: "standard-text-key",
    PLANNED_DATE_FROM: "planned-date-from",
    PLANNED_DATE_TO: "planned-date-to",
    PLANNED_DATE_BLANK_FLAG: "planned-date-blank-flag",
    CONTROL_KEY: "ZWC1",
    EXCLUDE_SYSTEM_STATUS_TECO: "TECO",
    EXCLUDE_SYSTEM_STATUS_CMPL: "CMPL",
    DEFAULT_DATE_STRING: "0000-00-00",
    DEFAULT_TIME_STRING: "00:00:00",
    ACTIVITY: "activity",
    PLANT_SECTION: "plant-section",
    VALID_DATE: "valid-date",
    DESIGNATION_NAME: "designation-name",
    ASSET_TASK_GROUP_NAME: "asset-task-group-name",
    VALID_START_DATE: "valid-start-date",
    VALID_END_DATE: "valid-end-date",
    WORK_START_TIME: "work-start-time",
    WORK_END_TIME: "work-end-time",
    DESIGNATION_ID: "designation-id",
    ROUTINE_TASK_TEMPLATE_ID: "routine-task-template-id",
    IS_DELETED: "is-deleted",
    PATTERN: "pattern",
    PATTERN_RULE: "pattern-rule",
    ROUTING_ID: "routing-id",
    ROUTING_COUNTER: "routing-counter",
    ACTIVITY_ID: "activity-id",
    IS_LOCK: "is-lock",
    SAP_TASK_CATEGORY_ID: "sap-task-category-id",
    ACTUAL_START_DATE_TIME: "actual-start-date-time",
    ACTUAL_END_DATE_TIME: "actual-end-date-time",
    FUNCTIONAL_LOCATION: "functional-location",
    IS_ASSET_CODE_AVAILABLE: "is-asset-code-available",
    ASSET_CODE_FLAG: "ASSET_CODE",
    USER_ID: "user-id",
    TYPE: "type",
    TASK_AUDITS: "task-audits",
    OPERATION_ID: "operation-id",
    OPERATION_NAME: "operation-name",
    EVENT_TYPE: "event-type",
    EVENT_TYPE_SORT_NUMBER: "event-type-sort-number",
    DELETE_STATUS: "delete-status",
    TASK_TYPE: "task-type",
    IS_ATTACHED_WITH_SAP: "is-attached-with-sap",
    IS_EVENT_TYPE_DELETED: "is-event-type-delete",
    IS_TASK_TYPE_DELETED: "is-task-type-delete",
    ASSET: "asset",
    TEAM: "teams",
    TEAM_NAME: "team-name",
    OPERATION: "operation",
    ASSET_GROUP_ID: "asset-group-id",
    HOURS_PER_DAY: "hours-per-day",
    IS_OPERATION_EVENT_DELETED: "is-operation-event-delete",
  },
  ERROR_TYPES: {
    NOT_FOUND_ASSET_CODE: "NOT_FOUND_ASSET_CODE",
    NOT_FOUND_TASK_ID: "NOT_FOUND_TASK_ID",
    NOT_FOUND_TASK_FORECAST_ID: "NOT_FOUND_TASK_FORECAST_ID",
    NOT_FOUND_EVENT_TEMPLATE_ID_OR_TASK_TYPE_ID: "NOT_FOUND_EVENT_TYPE_ID_OR_TASK_TYPE_ID",
    NOT_FOUND_ASSET_TASK_GROUP_ID: "NOT_FOUND_ASSET_TASK_GROUP_ID",
    NOT_FOUND_EVENT_TYPE_ID: "NOT_FOUND_EVENT_TYPE_ID",
    NOT_FOUND_TASK_TYPE_ID: "NOT_FOUND_TASK_TYPE_ID",
    NOT_FOUND_POWER_PLANT_ID: "NOT_FOUND_POWER_PLANT_ID",
    NOT_FOUND_VALID_DATE: "NOT_FOUND_VALID_DATE",
    NOT_FOUND_ROUTINE_TASK_TEMPLATE_ID: "NOT_FOUND_ROUTINE_TASK_TEMPLATE_ID",
    NOT_FOUND_SAP_TASK_CATEGORY_ID: "NOT_FOUND_SAP_TASK_CATEGORY_ID",
    NOT_FOUND_EVENT_TYPE_ID_OR_OPERATION_ID: "NOT_FOUND_EVENT_TYPE_ID_OR_OPERATION_ID",
    NOT_FOUND_EVENT_TYPE_NAME: "NOT_FOUND_EVENT_TYPE_NAME",
    NOT_FOUND_TASK_TYPE_NAME: "NOT_FOUND_TASK_TYPE_NAME",
    NOT_FOUND_TASK_EXECUTION_TIME: "NOT_FOUND_TASK_EXECUTION_TIME",
    NOT_FOUND_USER_ID: "NOT_FOUND_USER_ID",
    NOT_FOUND_OPERATION_NAME: "NOT_FOUND_OPERATION_NAME",
    INVALID_EVENT_TYPE_NAME: "INVALID_EVENT_TYPE_NAME",
    INVALID_TASK_TYPE_NAME: "INVALID_TASK_TYPE_NAME",
    NOT_FOUND_OPERATION_ID: "NOT_FOUND_OPERATION_ID",
    EVENTTYPE_ATTACH_WITH_SAP: "EVENT_TYPE_ATTACH_WITH_SAP",
    INVALID_ASSET_TASK_GROUP_NAME: "INVALID_ASSET_TASK_GROUP_NAME",
    NOT_FOUND_TEAM_ID: "NOT_FOUND_TEAM_ID",
  },
  STATUS_CODES: {
    SUCCESS_CODE: 200,
    CREATE_SUCCESS_CODE: 201,
  },
  ERROR_CODES: {
    UNAUTHORIZED_CODE: 401,
    NOT_FOUND_CODE: 404,
    BAD_REQUEST: 400,
    CONFLICT: 409,
    REQUIRE_PARAMETER: 422,
    SERVER_ERROR: 500,
  },
  ERROR_MESSAGES: {
    USER_ID_NOT_FOUND: "Not Found - User id was not found",
    DATA_NOT_FOUND: "Not Found - Data",
    SERVER_ERROR: "Internal Server Error",
    ASSET_CODE_REQUIRE: "asset-code is require",
    BAD_REQUEST: "Bad Request",
    FAILURE: "fail",
    CONFLICT: "Conflict",
    POWER_PLANT_ID_NOT_FOUND: "Not Found - power-plant-id was not found",
    TASK_ID_NOT_FOUND: "Not Found - Task id was not found",
    USER_ASSIGNEE_NOT_FOUND: "Not Found - User Assignee was not found",
    OPERATE_USER_ID_NOT_FOUND: "Not Found - Operate user id was not found",
    TASK_NOT_FOUND: "Not Found - Task was not found",
    INVALID_ACTUAL_START_DATE: "Invalid - actual-start-date-time is invalid",
    INVALID_ACTUAL_END_DATE: "Invalid - actual-end-date-time is invalid",
    INVALID_PLANNED_DATE_TIME: "Invalid - planned-date-time is invalid",
  },
  SUCCESS_MESSAGES: {
    SUCCESS: "OK",
  },
  NOTIFICATION: {
    TASK_REMINDER_TITLE: "タスクの開始10分前です",
    TASK_NAME: "タスク名",
    SCHEDULE_DATE_AND_TIME: "予定日時",
  },

  IS_NOT_DELETED: 0,
  IS_DELETED: 1,
  IS_NOT_ATTACHED_WITH_SAP: 0,
  IS_ATTACHED_WITH_SAP: 1,
  DEFAULT_TASK_PRIORITY_ID: 3,
  REGEX: {
    HHMMSS: /^(?:(?:([01]\d|2[0-3]):)([0-5]\d))$/,
  },
  INACTIVE_USER: {
    POWER_PLANT_ID: "XX_",
    ASSET_TASK_GROUP_ID: 6,
    TEAM_ID: 21,
    AFTER_TIME: 1000 * 3600 * 24 * 10, // 10 days
  },
} as const
