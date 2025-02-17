// Initially copied from DPM-BE, commit d0e2f45544cc9890762f93cf3e8f224f15efd619
import { I18n } from "i18n"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const i18n = new I18n()
i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ["en", "ja"],

  // you may alter a site wide default locale
  defaultLocale: "en",

  // will return translation from defaultLocale in case current locale doesn't provide it
  retryInDefaultLocale: false,

  // where to store json files
  directory: path.resolve(__dirname, "./locales"),

  // enable object notation
  objectNotation: true,
})

export { i18n }
