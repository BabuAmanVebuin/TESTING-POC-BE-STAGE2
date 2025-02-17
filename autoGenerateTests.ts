// Step 1: Importing Required Modules
import OpenAI from "openai"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Step 2: Load Environment Variables
dotenv.config()

// Step 3: Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
})

// Step 4: Define Paths to Different Files
const controllersDir = path.join(__dirname, "./src/interface/controllers/dpm/KPI003")
const useCasesDir = path.join(__dirname, "./src/application/use_cases/dpm")
const repositoriesDir = path.join(__dirname, "./src/infrastructure/repositories/dpm")
const portDir = path.join(__dirname, "./src/application/port")
const entityDir = path.join(__dirname, "./src/infrastructure/orm/typeorm/entities")
const dtoDir = path.join(__dirname, "./src/domain/entities/dpm")
const routeDir = path.join(__dirname, "./src/infrastructure/webserver/express")
// Step 5: Define Test Output Directory
const testOutputDir = path.join(__dirname, "./test/test4o")
// Step 6: Ensure Test Directory Exists
fs.mkdirSync(testOutputDir, { recursive: true })

// Step 7: Recursively Get All TypeScript Files
const getAllTsFiles = (dir: string): string[] => {
  let files: string[] = []
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(getAllTsFiles(fullPath))
    } else if (entry.name.endsWith(".ts")) {
      files.push(fullPath)
    }
  })
  return files
}

// Step 8: Detect Controller Files
const detectedControllers = getAllTsFiles(controllersDir)

// Step 9: Define the mapping between use cases and their corresponding files (repository, port, entity, dto, route)
function getFileMapping(): Record<
  string,
  { apiPath: string; repo: string[]; port: string[]; entity: string[]; dto: string; route: string }
> {
  return {
    getBasicChargePlan: {
      apiPath: "GET /basic-charge/plan",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: "basicChargePlan.ts",
      route: "basicChargeRoutes.ts",
    },
    upsertBasicChargePlan: {
      apiPath: "PUT /basic-charge/plan",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: "basicChargePlan.ts",
      route: "basicChargeRoutes.ts",
    },
    getBasicChargePlanSummary: {
      apiPath: "GET /basic-charge/plan/summary",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: "basicChargePlanSummary.ts",
      route: "basicChargeRoutes.ts",
    },
    // Define mappings for other use cases...
  }
}

const fileMap = getFileMapping()

// Step 10: Generate the list of test files corresponding to the detected controllers
const detectedTestFiles = detectedControllers.map((controllerPath) => {
  const controllerFile = path.relative(controllersDir, controllerPath)
  const baseName = path.basename(controllerFile, ".ts").replace("Controller", "")

  const useCaseFile = path.join(path.dirname(controllerFile), `${baseName}UseCase.ts`)
  const useCasePath = useCaseFile ? path.join(useCasesDir, useCaseFile) : ""

  // Get file mappings for the base controller name
  const files = fileMap[baseName] || {
    apiPath: "",
    repo: [],
    port: [],
    entity: [],
    dto: "",
    route: "",
  }

  // Map the repository, port, entity, dto, and route paths
  const repoPath = files.repo.map((repo) => path.join(repositoriesDir, repo))
  const portPath = files.port.map((port) => path.join(portDir, port))
  const entityPath = files.entity.map((entity) => path.join(entityDir, entity))
  const dtoPath = files.dto ? path.join(dtoDir, files.dto) : ""
  const routePath = files.route ? path.join(routeDir, files.route) : ""

  // Check if the required files exist
  const useCaseExists = fs.existsSync(useCasePath)
  const repoExists = repoPath && repoPath.every((repo) => fs.existsSync(repo))
  const portExists = portPath && portPath.every((port) => fs.existsSync(port))
  const entityExists = entityPath && entityPath.every((entity) => fs.existsSync(entity))
  const dtoExists = dtoPath && fs.existsSync(dtoPath)
  const routeExists = routePath && fs.existsSync(routePath)

  console.log(`📝 Checking: ${baseName}`)
  console.log(`  🔹 API Path: ${files.apiPath || "N/A"} → Exists? ${files.apiPath ? true : false}`)
  console.log(`  🔹 Controller: ${controllerFile}`)
  console.log(`  🔹 Use Case: ${useCaseFile} → Exists? ${useCaseExists}`)
  console.log(`  🔹 Repository: ${files.repo || "N/A"} → Exists? ${repoExists}`)
  console.log(`  🔹 Port: ${files.port || "N/A"} → Exists? ${portExists}`)
  console.log(`  🔹 Entity: ${files.entity || "N/A"} → Exists? ${entityExists}`)
  console.log(`  🔹 DTO: ${files.dto || "N/A"} → Exists? ${dtoExists}`)
  console.log(`  🔹 Route: ${files.route || "N/A"} → Exists? ${routeExists}`)

  return {
    name: `${baseName}.test.ts`,
    apiPath: files.apiPath,
    controller: controllerFile,
    useCase: useCaseExists ? useCaseFile : null,
    repo: repoExists ? files.repo : null,
    port: portExists ? files.port : null,
    entity: entityExists ? files.entity : null,
    dto: dtoExists ? files.dto : null,
    route: routeExists ? files.route : null,
  }
})

// Step 11: Function to read the content of a file safely
const readFileContent = (filePath: string): string | null => {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    console.warn(`⚠️ Warning: File not found - ${filePath}`)
    return null
  }
}

// Step 12: Function to generate the test cases by sending the prompt to OpenAI API
async function generateTest(
  fileName: string,
  apiPath: string,
  controllerFile: string,
  useCaseFile: string | null,
  repositoryFile: string[] | null,
  portFile: string[] | null,
  entityFile: string[] | null,
  dtoFile: string | null,
  routeFile: string | null,
) {
  const controllerPath = path.join(controllersDir, controllerFile)
  const useCasePath = useCaseFile ? path.join(useCasesDir, useCaseFile) : null
  const repositoryPath = repositoryFile?.map((repo) => path.join(repositoriesDir, repo))
  const portPath = portFile?.map((port) => path.join(portDir, port))
  const entityPath = entityFile?.map((entity) => path.join(entityDir, entity))
  const dtoPath = dtoFile ? path.join(dtoDir, dtoFile) : null
  const routePath = routeFile ? path.join(routeDir, routeFile) : null

  const controllerCode = readFileContent(controllerPath)
  const useCaseCode = useCasePath ? readFileContent(useCasePath) : null
  const repositoryCode = repositoryPath?.map(readFileContent)
  const portCode = portPath?.map(readFileContent)
  const entityCode = entityPath?.map(readFileContent)
  const dtoCode = dtoPath ? readFileContent(dtoPath) : null
  const routeCode = routePath ? readFileContent(routePath) : null

  if (!controllerCode || !useCaseCode || !repositoryCode || !routeCode) {
    console.error(`❌ Skipping test generation for ${fileName} due to missing files.`)
    return
  }

  // Step 13: Creating a Integration Test Prompt
  const integrationPrompt = `
  STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

  Given the following TypeScript files, you MUST generate test cases for ONLY the specified **API Path**:

  **API Path:**
  \`\`\`typescript
  ${apiPath}
  \`\`\`

  **Route:**
  \`\`\`typescript
  ${routeCode}
  \`\`\`

  **Controller:**
  \`\`\`typescript
  ${controllerCode}
  \`\`\`

  **Use Case:**
  \`\`\`typescript
  ${useCaseCode}
  \`\`\`

  **Repository:**
  \`\`\`typescript
  ${repositoryCode}
  \`\`\`

  **Port:**
  \`\`\`typescript
  ${portCode}
  \`\`\`

  **Entity:**
  \`\`\`typescript
  ${entityCode}
  \`\`\`

  **DTO:**
  \`\`\`typescript
  ${dtoCode}
  \`\`\`

  YOU MUST GENERATE a **complete and exhaustive integration API test consisting of a minimum of 20 test cases, focusing on the full API flow from beginning to end** in TypeScript.

  **MANDATORY REQUIREMENTS (DO NOT IGNORE ANY):**
  - The test **MUST** be written using **Mocha** as the test runner.
  - The test **MUST** use **Chai** for assertions.
  - The test **MUST** use **Supertest** for API requests.
  - The test **MUST** manage database state using **Sequelize transactions**.
  - The test **MUST** ensure **ALL POSSIBLE CASES, including both SUCCESS and FAILURE scenarios, are covered completely**.
  - **DO NOT SKIP ANY CONTENTS OR EDGE CASES**.
  - **DO NOT** wrap the output inside code blocks like \`\`\`typescript.
  - **The output MUST ONLY contain valid TypeScript Mocha test code—NO COMMENTS, NO EXPLANATIONS, NO EXTRA TEXT.**
  - **FAILURE TO FOLLOW THESE INSTRUCTIONS WILL BE CONSIDERED AN ERROR.**

  **ADDITIONAL MANDATORY FIXES TO AVOID COMMON ERRORS:**
  1. **Ensure correct relative imports:**
     - The test file **MUST** use '../../../src/...' instead of '@src/'.
     - Example:
       ✅ **Correct:**
       \`import { createRouter } from '../../../src/infrastructure/webserver/express/routes';\`  
       ❌ **Incorrect:**
       \`import { createRouter } from '@src/infrastructure/webserver/express/routes';\`

  2. **Ensure Sequelize handles transactions correctly:**
     - The test **MUST** use transaction management for inserting and rolling back test data.
     - Example:
       \`await startTransaction((transaction) => beforeHookFixtures(transaction));\`
     - The test **MUST** properly close transactions after tests.

  3. **Ensure Mocha resolves paths properly:**
     - The test **MUST** import modules using '../../../src/...'.
     - The test **MUST NOT** use module aliases.

  4. **Ensure database fixtures are used for consistent test data:**
     - The test **MUST** use \`insertFixture\` to preload necessary data.
     - Example:
       \`await insertFixture("insertBasicChargePlanSummary.sql", transaction);\`

  5. **Ensure test output is not wrapped in code blocks:**
     - The generated test MUST not wrap the test code inside TypeScript code blocks like \`\`\`\typescript\`\`\`. It should be plain TypeScript code without any wrapping.

  **Final Note:**
  - The generated test file **MUST** run successfully in a TypeScript project using Mocha, Chai, and Sequelize.
  - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

  NOW, GENERATE THE TEST.
`;


  try {
    // Step 14: Sending API Requests to OpenAI for Integration Test
    const integrationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "developer", content: integrationPrompt }],
      max_tokens: 14000,
      temperature: 0.0,
      top_p: 0.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    // Step 15: Saving the Generated Integration Test
    if (integrationResponse?.choices?.[0]?.message?.content) {
      const filePath = path.join(testOutputDir, "integration", fileName)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, integrationResponse.choices[0].message.content.trim(), { encoding: "utf8" })
      console.log(`✅ Generated Integration Test: ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error generating tests for ${fileName}:`, error)
  }

  // Step 16: Creating a Unit Test Prompt
  const unitPrompt = `
   STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

  Given the following TypeScript files, you MUST generate test cases for ONLY the specified **API Path**:

   **API Path:**
  \`\`\`typescript
  ${apiPath}
  \`\`\`

  **Route:**
  \`\`\`typescript
  ${routeCode}
  \`\`\`

  **Controller:**
  \`\`\`typescript
  ${controllerCode}
  \`\`\`

  **Use Case:**
  \`\`\`typescript
  ${useCaseCode}
  \`\`\`

  **Repository:**
  \`\`\`typescript
  ${repositoryCode}
  \`\`\`

  **Port:**
  \`\`\`typescript
  ${portCode}
  \`\`\`

  **Entity:**
  \`\`\`typescript
  ${entityCode}
  \`\`\`

  **DTO:**
  \`\`\`typescript
  ${dtoCode}
  \`\`\`

  YOU MUST GENERATE a **complete and exhaustive unit test consisting of a minimum of 20 test cases, focusing only on the Use Case file** in TypeScript.

  **MANDATORY REQUIREMENTS (DO NOT IGNORE ANY):**
  - The test **MUST** be written using **Mocha** as the test runner.
  - The test **MUST** use **Chai** for assertions.
  - The test **MUST** ensure that **the Repository is properly mocked**.
  - The test **MUST** include both **successful and failure cases**.
  - **DO NOT SKIP ANY CONTENTS OR EDGE CASES**.
  - **DO NOT** wrap the output inside code blocks like \`\`\`typescript.
  - **The output MUST ONLY contain valid TypeScript Mocha test code—NO COMMENTS, NO EXPLANATIONS, NO EXTRA TEXT.**
  - **FAILURE TO FOLLOW THESE INSTRUCTIONS WILL BE CONSIDERED AN ERROR.**

  **ADDITIONAL MANDATORY FIXES TO AVOID COMMON ERRORS:**
  1. **Ensure correct relative imports:**
     - The test file **MUST** use '../../../src/...' instead of '@src/'.
     - Example:
       ✅ **Correct:**
       \`import { getPaymentRecordByIdNameUseCase } from '../../../src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`  
       ❌ **Incorrect:**
       \`import { getPaymentRecordByIdNameUseCase } from '@src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`

  2. **Ensure proper repository mocking:**
     - The test **MUST** mock repository methods.

  3. **Ensure Mocha resolves paths properly:**
     - The test **MUST** import modules using '../../../src/...'.
     - The test **MUST NOT** use module aliases.

  4. **Ensure database fixtures are used for consistent test data (if required):**
     - The test **MUST** use \`insertFixture\` to preload necessary data.
     - Example:
       \`await insertFixture("insertBasicChargePlanSummary.sql", transaction);\`

  5. **Ensure test output is not wrapped in code blocks:**
     - The generated test MUST not wrap the test code inside TypeScript code blocks like \`\`\`\typescript\`\`\`. It should be plain TypeScript code without any wrapping.

  **Final Note:**
  - The generated test file **MUST** run successfully in a TypeScript project using Mocha and Chai.
  - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

  NOW, GENERATE THE TEST.
`;


  try {
    // Step 17: Sending API Requests to OpenAI for Unit Test
    const unitResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "developer", content: unitPrompt }],
      max_tokens: 14000,
      temperature: 0.0,
      top_p: 0.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    console.log(unitResponse.model)

    // Step 18: Saving the Generated Unit Test
    if (unitResponse?.choices?.[0]?.message?.content) {
      const unitFilePath = path.join(testOutputDir, "unit", fileName)
      fs.mkdirSync(path.dirname(unitFilePath), { recursive: true })
      fs.writeFileSync(unitFilePath, unitResponse.choices[0].message.content.trim(), { encoding: "utf8" })
      console.log(`✅ Generated Unit Test: ${unitFilePath}`)
    }
  } catch (error) {
    console.error(`❌ Error generating tests for ${fileName}:`, error)
  }
}

// Step 19: Generate All Tests
async function generateAllTests() {
  for (const { name, apiPath, controller, useCase, repo, port, entity, dto, route } of detectedTestFiles) {
    console.log(`Generating test for: ${name}`)
    console.log(`  apiPath: ${apiPath}`)
    console.log(`  Controller: ${controller}`)
    console.log(`  Use Case: ${useCase}`)
    console.log(`  Repository: ${repo}`)
    console.log(`  Port: ${port}`)
    console.log(`  Entity: ${entity}`)
    console.log(`  DTO: ${dto}`)
    console.log(`  Route: ${route}`)
    await generateTest(
      name,
      apiPath,
      controller,
      useCase || null,
      repo || null,
      port || null,
      entity || null,
      dto || null,
      route || null,
    )
  }
}

// Step 20: Start Test Generation
generateAllTests()
