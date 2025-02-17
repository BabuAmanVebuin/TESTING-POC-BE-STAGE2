export type MissingRequiredParameterError = {
  readonly _tag: "MissingRequiredParameterError"
  readonly message: string
}

export const missingRequiredParameterError = (message: string): MissingRequiredParameterError => ({
  _tag: "MissingRequiredParameterError",
  message: `ApplicationError: ${message}`,
})
