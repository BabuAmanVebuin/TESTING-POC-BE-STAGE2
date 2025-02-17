// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { MissingRequiredParameterError } from "./MissingRequiredParameterError.js"
import { InvalidPlantNameError } from "./InvalidPlantNameError.js"
import { InvalidUnitNameError } from "./InvalidUnitNameError.js"
import { InvalidPlantCodeError } from "./InvalidPlantCodeError.js"
import { InvalidPlantAndUnitCodeError } from "./InvalidUnitCodeError.js"
import { InvalidFiscalYearError } from "./InvalidFiscalYearError.js"
import { InvalidStartupModeError } from "./InvalidStartupModeError.js"
import { InvalidEpochTimeStampError } from "./InvalidEpochTimeStampError.js"
import { InvalidDefectIdError } from "./InvalidDefectIdError.js"
import { InvalidForecastCategoryError } from "./InvalidForecastCategoryError.js"
import { InvalidGranularityCategoryError } from "./InvalidGranularityCategoryError.js"

export type ApplicationError =
  | MissingRequiredParameterError
  | InvalidPlantNameError
  | InvalidUnitNameError
  | InvalidPlantCodeError
  | InvalidPlantAndUnitCodeError
  | InvalidFiscalYearError
  | InvalidStartupModeError
  | InvalidEpochTimeStampError
  | InvalidDefectIdError
  | InvalidForecastCategoryError
  | InvalidGranularityCategoryError
