// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

/* eslint-disable @typescript-eslint/no-explicit-any */

import { pipe } from "fp-ts/lib/function.js"
import * as D from "io-ts/lib/Decoder.js"
import { Constants } from "../../../../config/constants.js"

export type mediaMimeType = "image/png" | "image/jpeg" | "video/mp4" | "video/quicktime" | "document/pdf" | "audio/m4a"
export type attachmentTypes = "Asset" | "Measurement-Record"

export const getIosDate = (dt: string): Date => {
  const [yyyy, mm, dd] = dt.split("-")
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

export const getDateFromDateTimeString = (dt: string): Date => {
  return new Date(Date.parse(dt))
}

//Get datetime from datetimewithtimezone
export const getDateFromDateTimeWithoutTimezone = (dt: string): Date => {
  const extractedDateFromTimeZone = dt.includes("+") ? dt.split("+") : dt
  const extractDateTime = Array.isArray(extractedDateFromTimeZone)
    ? extractedDateFromTimeZone[0].concat("Z")
    : extractedDateFromTimeZone
  return new Date(Date.parse(extractDateTime))
}
//Get Date from Datetime
export const getDateFromDateTime = (dt: string): string => {
  const extractedDateFromTimeZone = dt.includes("T") ? dt.split("T") : dt
  const extractDateTime = Array.isArray(extractedDateFromTimeZone)
    ? extractedDateFromTimeZone[0]
    : extractedDateFromTimeZone
  return extractDateTime
}

export const validDate = (dt: string | undefined): boolean => {
  if (dt === undefined || dt === null) {
    return false
  }
  const [yyyy, mm, dd] = dt.split("-")
  const dt2 = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const [yyyy2, mm2, dd2] = [dt2.getFullYear(), dt2.getMonth() + 1, dt2.getDate()]
  return Number(yyyy) === Number(yyyy2) && Number(mm) === Number(mm2) && Number(dd) === Number(dd2)
}

export const validDateTime = (dt: string | undefined): boolean => {
  // 2020-01-01T00:00:00.000Z
  if (dt === undefined || dt === null) {
    return false
  } else {
    return (
      dt.split("T").length > 1 &&
      validDate(dt.split("T")[0]) &&
      getDateFromDateTimeString(dt).toString() !== "Invalid date"
    )
  }
}

// Not currently using this as there doesn't seem to be a way to pass the parsed object into the controller itself.
// /* Accepts a string in yyyy-mm-dd format.
// Determines that the string is valid, and then returns a date object. */
// export const iosDateDecoder: D.Decoder<unknown, Date> = {
//   decode: (toDecode) => (typeof toDecode === 'string' && validDate(toDecode) ? D.success(getIosDate(toDecode)) : D.failure(toDecode, 'Date')),
// };

/*  Ensures a date object is present */
export const dateDecoder: D.Decoder<unknown, Date> = {
  decode: (toDecode) =>
    toDecode instanceof Date && toDecode.toString() !== "Invalid Date"
      ? D.success(toDecode)
      : D.failure(toDecode, "Date"),
}

/**
 *  validate HH:MM:SS
 */
export const validateHHMMSS = () =>
  pipe(
    D.string,
    D.refine((input): input is string => Constants.REGEX.HHMMSS.test(input), `valid`),
  )

/**
 * validate string must be non empty
 */
export const nonEmptyString = () =>
  pipe(
    D.string,
    D.refine((input): input is string => input.trim().length > 0, `non empty`),
  )

/**
 * validate array length
 */
export const nonEmptyArray = (arrType: D.Decoder<unknown, unknown>) =>
  pipe(
    D.array(arrType),
    D.refine((input: any[]): input is any[] => input.length > 0, `non empty`),
  )

/*  Ensures a date object is present */
export const assetStatusDecoder: D.Decoder<unknown, string> = {
  decode: (toDecode) =>
    toDecode === "Green" || toDecode === "Yellow" || toDecode === "Red"
      ? D.success(toDecode)
      : D.failure(toDecode, "Invalid Status"),
}

export const fileAttachmentTypeDecoder: D.Decoder<unknown, attachmentTypes> = D.literal("Asset", "Measurement-Record")

export const mimeTypeDecoder: D.Decoder<unknown, mediaMimeType> = D.literal(
  "image/png",
  "image/jpeg",
  "video/mp4",
  "video/quicktime",
  "document/pdf",
  "audio/m4a",
)

export enum ERROR_CODES {
  UNASUTHORIZED_CODE = 401,
  NOT_FOUND_CODE = 404,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  REQUIRE_PARAMETER = 422,
  SERVER_ERROR = 500,
}

export enum STATUS_CODES {
  SUCCESS_CODE = 200,
  CREATE_SUCCESS_CODE = 201,
}

export enum STATUS_MESSAGE {
  SUCCESS_MESSAGE = "OK",
}
// /*  Ensures a date object is present */
// export const mimeTypeDecoder: D.Decoder<unknown, "image/png" | "image/jpeg" | "video/mp4" | "video/quicktime" | "document/pdf" | "audio/m4a"> = {
//   decode: (toDecode) => (
//     (toDecode === "image/png" || toDecode === "image/jpeg" || toDecode === "video/mp4" || toDecode === "video/m4a" || toDecode === "video/quicktime" || toDecode === "document/pdf") ?
//     D.success(toDecode) : D.failure(toDecode, 'Unsupported Media Type')),
// };

// /* Asset IDs arrive as Strings when sent as an HTTP request, but we want to deal with them as numbers for the purpose of the app. */
// export const assetIdDecoder: D.Decoder<unknown, number> = {
//   decode: (toDecode) => (typeof toDecode === 'string' && isNaN(Number(toDecode)) ? D.failure(toDecode, 'Number') : D.success(Number(toDecode))),
// };

// export const iosDateType = new t.Type<Date, string, unknown>(
//   'iosDate',
//   (input: unknown): input is Date => input instanceof Date,
//   // `t.success` and `t.failure` are helpers used to build `Either` instances
//   (input, context) =>
//     either.chain(t.string.validate(input, context), (dtstring) => {
//       const decodedDate = validDate(dtstring) ? getIosDate(dtstring) : null;
//       return decodedDate === null ? t.failure(input, context) : t.success(decodedDate);
//     }),
//   // `A` and `O` are the same, so `encode` is just the identity function
//   (a) => a.toISOString(),
// );
