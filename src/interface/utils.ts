import logger from "../infrastructure/logger.js"

export const retryFn = async (fn: () => Promise<void>, retries: number = 1) => {
  let attempts = 0
  while (attempts <= retries) {
    try {
      await fn()
      return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(error)
      if (attempts < retries) {
        logger.warn(`Retrying...(${attempts + 1}/${retries})`)
      }
    } finally {
      attempts++
    }
  }
}
