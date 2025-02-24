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
const controllersDir = path.join(__dirname, "./src/interface/controllers/dpm")
const useCasesDir = path.join(__dirname, "./src/application/use_cases/dpm")
const repositoriesDir = path.join(__dirname, "./src/infrastructure/repositories/dpm")
const portDir = path.join(__dirname, "./src/application/port")
const entityDir = path.join(__dirname, "./src/infrastructure/orm/typeorm/entities")
const dtoDir = path.join(__dirname, "./src/domain")
const routeDir = path.join(__dirname, "./src")
const sqlDir = path.join(__dirname, "./src/interface/controllers/dpm")
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

// Step 9: Define the mapping between use cases and their corresponding files
function getFileMapping(): Record<
  string,
  {
    apiPath: string
    repoName: string
    useCase: string
    repo: string[]
    port: string[]
    entity: string[]
    dto: string[]
    route: string
    sql: string[]
  }
> {
  return {
    getBasicChargePlan: {
      apiPath: "GET /basic-charge/plan",
      repoName: "getBasicChargePlan",
      useCase: "getBasicChargePlanUsecase.ts",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: ["entities/dpm/basicChargePlan.ts"],
      route: "infrastructure/webserver/express/basicChargeRoutes.ts",
      sql: [],
    },
    upsertBasicChargePlan: {
      apiPath: "PUT /basic-charge/plan",
      repoName: "upsertBasicChargePlan",
      useCase: "upsertBasicChargePlanUsecase.ts",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: ["entities/dpm/basicChargePlan.ts"],
      route: "infrastructure/webserver/express/basicChargeRoutes.ts",
      sql: [],
    },
    getBasicChargePlanSummary: {
      apiPath: "GET /basic-charge/plan/summary",
      repoName: "getBasicChargePlanSummary",
      useCase: "getBasicChargePlanSummaryUsecase.ts",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: ["entities/dpm/basicChargePlanSummary.ts"],
      route: "infrastructure/webserver/express/basicChargeRoutes.ts",
      sql: [],
    },
    getBasicCharge: {
      apiPath: "GET /basic-charge",
      repoName: "getBasicCharge",
      useCase: "generateBasicChargeResponseUseCase.ts",
      repo: ["snowflake/basicChargeRepositorySnowflake.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: ["models/dpm/KPI003/Index.ts"],
      route: "interface/routes/dpm/getBasicCharge.ts",
      sql: [],
    },
    getKPI004: {
      apiPath: "GET /kpi004",
      repoName: "",
      useCase: "",
      repo: [],
      port: ["Kpi003RepositoryPort.ts"],
      entity: [],
      dto: ["models/dpm/Kpi004.ts"],
      route: "interface/routes/dpm/getKPI004.ts",
      sql: ["KPI004/sql/KPI004Query.ts"],
    },
    // Define mappings for other use cases...
  }
}

const fileMap = getFileMapping()

// Step 10: Generate the list of test files corresponding to the detected controllers
const detectedTestFiles = detectedControllers.map((controllerPath) => {
  const controllerFile = path.relative(controllersDir, controllerPath)
  const baseName = path.basename(controllerFile, ".ts").replace("Controller", "")

  // Get file mappings for the base controller name
  const files = fileMap[baseName] || {
    apiPath: "",
    repoName: "",
    useCase: "",
    repo: [],
    port: [],
    entity: [],
    dto: [],
    route: "",
    sql: [],
  }

  // Map the repository, port, entity, dto, and route paths
  const useCasePath = files.useCase ? path.join(useCasesDir, files.useCase) : ""
  const repoPath = files.repo.map((repo) => path.join(repositoriesDir, repo))
  const portPath = files.port.map((port) => path.join(portDir, port))
  const entityPath = files.entity.map((entity) => path.join(entityDir, entity))
  const dtoPath = files.dto.map((dto) => path.join(dtoDir, dto))
  const routePath = files.route ? path.join(routeDir, files.route) : ""
  const sqlPath = files.sql.map((sql) => path.join(sqlDir, sql))

  // Check if the required files exist
  const useCaseExists = useCasePath && fs.existsSync(useCasePath)
  const repoExists = repoPath && repoPath.every((repo) => fs.existsSync(repo))
  const portExists = portPath && portPath.every((port) => fs.existsSync(port))
  const entityExists = entityPath && entityPath.every((entity) => fs.existsSync(entity))
  const dtoExists = dtoPath && dtoPath.every((dto) => fs.existsSync(dto))
  const routeExists = routePath && fs.existsSync(routePath)
  const sqlExists = sqlPath && sqlPath.every((sql) => fs.existsSync(sql))

  console.log(`📝 Checking: ${baseName}`)
  console.log(`  🔹 API Path: ${files.apiPath || "N/A"} → Exists? ${files.apiPath ? true : false}`)
  console.log(`  🔹 Controller: ${controllerFile}`)
  console.log(`  🔹 Use Case: ${files.useCase || "N/A"} → Exists? ${useCaseExists}`)
  console.log(`  🔹 API Path: ${files.repoName || "N/A"} → Exists? ${files.repoName ? true : false}`)
  console.log(`  🔹 Repository: ${files.repo || "N/A"} → Exists? ${repoExists}`)
  console.log(`  🔹 Port: ${files.port || "N/A"} → Exists? ${portExists}`)
  console.log(`  🔹 Entity: ${files.entity || "N/A"} → Exists? ${entityExists}`)
  console.log(`  🔹 DTO: ${files.dto || "N/A"} → Exists? ${dtoExists}`)
  console.log(`  🔹 Route: ${files.route || "N/A"} → Exists? ${routeExists}`)
  console.log(`  🔹 SQL: ${files.sql || "N/A"} → Exists? ${sqlExists}`)

  return {
    name: `${baseName}.test.ts`,
    apiPath: files.apiPath,
    controller: controllerFile,
    useCase: useCaseExists ? files.useCase : null,
    repoName: files.repoName,
    repo: repoExists ? files.repo : null,
    port: portExists ? files.port : null,
    entity: entityExists ? files.entity : null,
    dto: dtoExists ? files.dto : null,
    route: routeExists ? files.route : null,
    sql: sqlExists ? files.sql : null,
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
  repoName: string,
  repositoryFile: string[] | null,
  portFile: string[] | null,
  entityFile: string[] | null,
  dtoFile: string[] | null,
  routeFile: string | null,
  sqlFile: string[] | null,
) {
  const controllerPath = path.join(controllersDir, controllerFile)
  const useCasePath = useCaseFile ? path.join(useCasesDir, useCaseFile) : null
  const repositoryPath = repositoryFile?.map((repo) => path.join(repositoriesDir, repo))
  const portPath = portFile?.map((port) => path.join(portDir, port))
  const entityPath = entityFile?.map((entity) => path.join(entityDir, entity))
  const dtoPath = dtoFile?.map((dtoFile) => path.join(dtoDir, dtoFile))
  const routePath = routeFile ? path.join(routeDir, routeFile) : null
  const sqlPath = sqlFile?.map((sqlFile) => path.join(sqlDir, sqlFile))

  const controllerCode = readFileContent(controllerPath)
  const useCaseCode = useCasePath ? readFileContent(useCasePath) : null
  const repositoryCode = repositoryPath?.map(readFileContent)
  const portCode = portPath?.map(readFileContent)
  const entityCode = entityPath?.map(readFileContent)
  const dtoCode = dtoPath?.map(readFileContent)
  const routeCode = routePath ? readFileContent(routePath) : null
  const sqlCode = sqlPath?.map(readFileContent)

  if (!controllerCode || !routeCode) {
    console.error(`❌ Skipping test generation for ${fileName} due to missing files.`)
    return
  }

  // Step 13: Creating a Integration Test Prompt
  const integrationPrompt = `
 Generate an exhaustive integration API test in TypeScript for the following API components—ONLY for the specified API path—with more than 20 test cases covering the full API flow (including both success and failure scenarios). Use Mocha as the test runner, Chai for assertions, Supertest for API requests, and Sequelize transactions to manage the database state.

Requirements:
- Use relative imports (e.g., '../../../src/...', not '@src/').
- Manage Sequelize transactions properly (open, rollback, and close transactions).
- Import modules using '../../../src/...' without module aliases.
- Initialize the Express app as follows:
  import express from 'express';
  const app = express();
  BasicChargeRoutes(app);
- Output only valid plain TypeScript Mocha test code with no comments, explanations, or extra text, and do not wrap the output in code blocks.

All instructions are mandatory.

Components:
API Path: ${apiPath}
Route: ${routeCode}
Controller: ${controllerCode}
Use Case: ${useCaseCode}
Repository (${repoName}): ${repositoryCode}
Port: ${portCode}
Entity: ${entityCode}
DTO: ${dtoCode}
SQL: ${sqlCode}
`

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

YOU MUST GENERATE a complete and exhaustive set of unit tests consisting of more than 20 test cases for the given use case in TypeScript. The test cases should focus on the logic of the use case and cover all relevant scenarios.

MANDATORY REQUIREMENTS (DO NOT IGNORE ANY):
- The test MUST be written using Mocha as the test runner.
- The test MUST use Chai for assertions.
- The test MUST mock any external dependencies or services used by the use case.
- The test MUST cover both SUCCESS and FAILURE scenarios, including edge cases and any potential exceptions that may occur in the use case logic.
- DO NOT skip any content or edge cases.
- DO NOT wrap the output inside code blocks like \`\`\`typescript.
- The output MUST ONLY contain valid TypeScript Mocha test code—NO COMMENTS, NO EXPLANATIONS, NO EXTRA TEXT.
- FAILURE TO FOLLOW THESE INSTRUCTIONS WILL BE CONSIDERED AN ERROR.

ADDITIONAL MANDATORY FIXES TO AVOID COMMON ERRORS:
1. Ensure correct relative imports:
   - The test file MUST use '../../../src/...' instead of '@src/'.
   - Example:
     ✅ Correct:
     \`import { MyUseCase } from '../../../src/application/use_cases/MyUseCase';\`  
     ❌ Incorrect:
     \`import { MyUseCase } from '@src/application/use_cases/MyUseCase';\`

2. Ensure Mocha and Chai handle assertions correctly:
   - The test MUST use Chai assertions (e.g., \`expect\`, \`assert\`, or \`should\`).

3. Ensure the use case is tested in isolation:
   - The test MUST mock any dependencies, like the repository or external services.
   - The test MUST isolate the use case from the repository and other external dependencies.

4. Ensure test output is not wrapped in code blocks:
   - The generated test MUST not wrap the test code inside TypeScript code blocks like \`\`\`\typescript\`\`\`. It should be plain TypeScript code without any wrapping.

5. Ensure proper test structure:
   - The test MUST contain setup (e.g., mocks), action (e.g., calling the use case method), and assertion (e.g., checking results).
   - Ensure that each test case is self-contained, and proper mocks are restored after tests to prevent side effects.

6. Strict Instructions Sometimes Don’t Work
   - All instructions given here are mandatory.
   - If any instruction conflicts, the stricter or more specific rule must be followed.

7. Type-Related Issues
   - Avoid sprinkling any types.
   - If code can infer or define more specific types, use them (e.g., interface, type).

8. Avoid Creating Unnecessary Empty Objects
   - Avoid creating unnecessary empty objects.
   - Do not send empty payloads or objects unless you are explicitly testing a scenario that requires them.

9. Don’t Use Error.message
   - Avoid using Error.message in tests.
   - Use Chai assertions instead (e.g., expect(error).to.equal('expected value') or expect(error).to.deep.equal(expected)).

10. Avoid Sending Incorrect Payloads (Unless Testing Error Cases)
   - Only send invalid payloads if you are testing a negative scenario.
   - For success scenarios, use valid input that matches all required columns.

11. Using the Correct ORM
   - If the code uses Sequelize, do not generate TypeORM code.
   - If it’s TypeORM, do not use Sequelize or mix references.

12. Use Necessary Columns When Inserting Data
   - If inserting data, ensure the payload contains all necessary columns.

13. Use Correct Chai Expectations
   - For example, expect(value).to.equal(...) or expect(value).to.deep.equal(...).
   - Avoid incorrect syntax like expect.to(...).

14. Limit Use of any
   - The test code must define or infer types whenever possible.

15. Avoid Flaky Tests
   - Do not rely on timing delays or unpredictable external services.
   - Keep tests deterministic and stable.

Final Note:
- The generated test file MUST run successfully in a TypeScript project using Mocha, Chai.
- STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.

Given the following TypeScript files, you MUST generate unit test cases for ONLY the specified Use Case:

Use Case:
\`\`\`typescript
${useCaseCode}
\`\`\`

Repository: ${repoName}
\`\`\`typescript
${repositoryCode}
\`\`\`

Port:
\`\`\`typescript
${portCode}
\`\`\`

Entity:
\`\`\`typescript
${entityCode}
\`\`\`

DTO:
\`\`\`typescript
${dtoCode}
\`\`\`

NOW, GENERATE THE TEST.

`

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
  for (const {
    name,
    apiPath,
    controller,
    useCase,
    repoName,
    repo,
    port,
    entity,
    dto,
    route,
    sql,
  } of detectedTestFiles) {
    console.log(`Generating test for: ${name}`)
    console.log(`  apiPath: ${apiPath}`)
    console.log(`  Controller: ${controller}`)
    console.log(`  Use Case: ${useCase}`)
    console.log(`  Repo Name: ${repoName}`)
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
      repoName,
      repo || null,
      port || null,
      entity || null,
      dto || null,
      route || null,
      sql || null,
    )
  }
}

// Step 20: Start Test Generation
generateAllTests()
