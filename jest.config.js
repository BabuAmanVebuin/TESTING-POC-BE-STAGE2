export default {
  verbose: true,
  testMatch: ["**/test/**/*.test.ts"],
  reporters: ["default", ["jest-junit", {}]],
}
