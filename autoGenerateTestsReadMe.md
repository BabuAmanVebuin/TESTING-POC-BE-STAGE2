# Automated Test File Generation

## Overview

This script automates the process of generating **unit tests** and **integration tests** for a Node.js TypeScript project. It detects controllers, maps them to their corresponding use cases and repositories, and then generates Jest-based test cases using OpenAI's GPT-4o model.

## Features

- **Automated Detection**: Scans the project directories to detect controllers, use cases, and repositories.
- **Integration & Unit Tests**: Generates both integration and unit tests separately.
- **Jest Framework**: Ensures all tests are written using Jest.
- **Error Handling with fp-ts/Either**: Implements error handling patterns for functional programming.
- **Mocking Repositories**: Uses mocked repositories to isolate dependencies during integration and unit tests.
- **Edge Case Coverage**: Ensures exhaustive test coverage for both success and failure scenarios.

## Directory Structure

```
src/
├── application/
│   ├── errors/
│   │   ├── MissingRequiredParameterError.ts
│   │   ├── TaskIDAlreadyExistsError.ts
│   │   ├── TaskIDDoesntExistError.ts
│   │   └── index.ts
│   ├── port/
│   │   └── repositories/
│   │       └── TaskRepositoryPort.ts
│   └── use_cases/
│       ├── createTaskUseCase.ts
│       ├── deleteTaskUseCase.ts
│       ├── findAllTasksUseCase.ts
│       ├── findTaskByIdUseCase.ts
│       └── updateTaskUseCase.ts
├── domain/
│   └── models/
│       └── Task.ts
├── infrastructure/
│   ├── env/
│   │   └── index.ts
│   ├── orm/
│   │   └── typeorm/
│   │       ├── config/
│   │       │   └── ormconfig.ts
│   │       └── entities/
│   │           └── Task.ts
│   ├── repositories/
│   │   ├── taskRepositoryInMemory.ts
│   │   └── taskRepositoryMySQL.ts
│   └── webserver/
│       └── express/
│           └── index.ts
├── interface/
│   ├── controllers/
│   │   ├── createTaskController.ts
│   │   ├── deleteTaskController.ts
│   │   ├── findAllTasksController.ts
│   │   ├── findTaskByIdController.ts
│   │   └── updateTaskController.ts
│   └── routes/
│       ├── apiDocs.ts
│       ├── createTask.ts
│       ├── deleteTask.ts
│       ├── findAllTasks.ts
│       ├── findTaskById.ts
│       ├── index.ts
│       ├── updateTask.ts
│       └── util.ts
│── .env
│── package.json
│── autoGenerateTests.ts (this script)
```

## Installation

Ensure you have the required dependencies:

```sh
npm install openai dotenv fs path
```

Also, set up your OpenAI API key in a `.env` file:

```sh
OPENAI_API_KEY=your_openai_api_key
```

## Script Creation

### Explanation of the Code

This script is an **automated test generator** for a **Node.js** and **TypeScript** project. It uses **OpenAI’s GPT-4o** model to generate **unit and integration tests** for detected controllers, their corresponding use cases, and repository files.

---

### Step-by-Step Breakdown

### Step 1: Importing Required Modules

```typescript
import OpenAI from "openai"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
```

- **OpenAI**: Used to interact with OpenAI’s API.
- **fs (File System)**: Helps in reading/writing files.
- **path**: Manages file and directory paths.
- **dotenv**: Loads environment variables from a `.env` file.

---

### Step 2: Load Environment Variables

```typescript
dotenv.config()
```

- Loads API keys and other sensitive information from a `.env` file.

---

### Step 3: Initialize OpenAI API

```typescript
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
})
```

- Initializes OpenAI with the API key stored in the `.env` file.

---

### Step 4: Define Paths to Different Files

```typescript
const controllersDir = path.join(__dirname, "./src/interface/controllers/dpm/KPI003")
const useCasesDir = path.join(__dirname, "./src/application/use_cases/dpm")
const repositoriesDir = path.join(__dirname, "./src/infrastructure/repositories/dpm")
const portDir = path.join(__dirname, "./src/application/port/repositories")
const entityDir = path.join(__dirname, "./src/infrastructure/orm/typeorm/entities")
const dtoDir = path.join(__dirname, "./src/domain/models")
const routeDir = path.join(__dirname, "./src/infrastructure/webserver/express")
```

- Defines paths for **controllers, use cases, port, repositories, entities, DTOs, and routes** within the project.

---

### Step 5: Define Test Output Directory

```typescript
const testOutputDir = path.join(__dirname, "./test/test4o")
```

- Specifies where generated test files will be saved.

---

### Step 6: Ensure Test Directory Exists

```typescript
fs.mkdirSync(testOutputDir, { recursive: true })
```

- Creates the test output directory if it doesn't already exist.

---

### Step 7: Recursively Get All TypeScript Files

```typescript
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
```

- Scans the given directory and **recursively** collects all `.ts` (TypeScript) files.

---

### Step 8: Detect Controller Files

```typescript
const detectedControllers = getAllTsFiles(controllersDir)
```

- Calls the function to get all **controller** files.

---

### Step 9: Define the mapping between use cases and their corresponding files (repository, port, entity, dto, route)

```typescript
function getFileMapping(): Record<
  string,
  { repo: string[]; port: string[]; entity: string[]; dto: string; route: string }
> {
  return {
    getBasicChargePlanSummaryController: {
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: ["BasicCharge.ts"],
      dto: "BasicChargeDto.ts",
      route: "basicChargeRoutes.ts",
    },
    // Define mappings for other use cases...
  }
}
```

- Returns a **mapping** that links **use case methods** to their respective **repository files**.

---

### Step 10: Generate the list of test files corresponding to the detected controllers

```typescript
const detectedTestFiles = detectedControllers.map((controllerPath) => {
  const controllerFile = path.relative(controllersDir, controllerPath)
  const baseName = path.basename(controllerFile, ".ts").replace("Controller", "")

  const useCaseFile = path.join(path.dirname(controllerFile), `${baseName}UseCase.ts`)
  const useCasePath = useCaseFile ? path.join(useCasesDir, useCaseFile) : ""

  const files = fileMap[baseName] || {
    repo: [],
    port: [],
    entity: [],
    dto: "",
    route: "",
  }

  const repoPath = files.repo.map((repo) => path.join(repositoriesDir, repo))
  const portPath = files.port.map((port) => path.join(portDir, port))
  const entityPath = files.entity.map((entity) => path.join(entityDir, entity))
  const dtoPath = files.dto ? path.join(dtoDir, files.dto) : ""
  const routePath = files.route ? path.join(routeDir, files.route) : ""

  const useCaseExists = fs.existsSync(useCasePath)
  const repoExists = repoPath && repoPath.every((repo) => fs.existsSync(repo))
  const portExists = portPath && portPath.every((port) => fs.existsSync(port))
  const entityExists = entityPath && entityPath.every((entity) => fs.existsSync(entity))
  const dtoExists = dtoPath && fs.existsSync(dtoPath)
  const routeExists = routePath && fs.existsSync(routePath)

  console.log(`📝 Checking: ${baseName}`)
  console.log(`  🔹 Controller: ${controllerFile}`)
  console.log(`  🔹 Use Case: ${useCaseFile} → Exists? ${useCaseExists}`)
  console.log(`  🔹 Repository: ${files.repo || "N/A"} → Exists? ${repoExists}`)
  console.log(`  🔹 Port: ${files.port || "N/A"} → Exists? ${portExists}`)
  console.log(`  🔹 Entity: ${files.entity || "N/A"} → Exists? ${entityExists}`)
  console.log(`  🔹 DTO: ${files.dto || "N/A"} → Exists? ${dtoExists}`)
  console.log(`  🔹 Route: ${files.route || "N/A"} → Exists? ${routeExists}`)

  return {
    name: `${baseName}.test.ts`,
    controller: controllerFile,
    useCase: useCaseExists ? useCaseFile : null,
    repo: repoExists ? files.repo : null,
    port: portExists ? files.port : null,
    entity: entityExists ? files.entity : null,
    dto: dtoExists ? files.dto : null,
    route: routeExists ? files.route : null,
  }
})
```

- Get file mappings for the base controller name.
- Map the repository, port, entity, dto, and route paths.
- Check if the required files exist.
- Logs the results of the check.

---

### Step 11: Read File Content

```typescript
const readFileContent = (filePath: string): string | null => {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    console.warn(`⚠️ Warning: File not found - ${filePath}`)
    return null
  }
}
```

- Reads the content of a file and returns it as a string.
- Returns `null` & log the warning if the file is not found.

---

## Step 12: Function to generate the test cases by sending the prompt to OpenAI API

```typescript
async function generateTest(
  fileName: string,
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

  if (!controllerCode || !useCaseCode) {
    console.error(`❌ Skipping test generation for ${fileName} due to missing files.`)
    return
  }
```

### Explanation

- This function **reads the content** of a given TypeScript file.
- Resolving File Paths.
- Validating Required Files.

---

## Step 13: Creating an Integration Test Prompt

```typescript
const integrationPrompt = `
      STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

      Given the following TypeScript files:

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

      **Route:**
      \`\`\`typescript
      ${routeCode}
      \`\`\`

      YOU MUST GENERATE a **Complete and exhaustive integration API test consisting of a minimum of 20 test cases, focusing on the full API flow from beginning to end** in TypeScript.

      **MANDATORY REQUIREMENTS (DO NOT IGNORE ANY):**
      - The test **MUST** be written using **Jest** as the testing framework.
      - The test **MUST** use **fp-ts/Either** for handling errors.
      - The test **MUST** use **fp-ts/Option** for handling optional values.
      - **ALL POSSIBLE CASES, including both SUCCESS and FAILURE scenarios, MUST be covered completely.**
      - **DO NOT SKIP ANY CONTENTS OR EDGE CASES.**
      - **DO NOT wrap the output inside code blocks like \`\`\`typescript**.
      - **The output MUST ONLY contain valid TypeScript Jest test code—NO COMMENTS, NO EXPLANATIONS, NO EXTRA TEXT.**
      - **FAILURE TO FOLLOW THESE INSTRUCTIONS WILL BE CONSIDERED AN ERROR.**

      **ADDITIONAL MANDATORY FIXES TO AVOID COMMON ERRORS:**
      1. **Fix 'Cannot find module' errors by enforcing correct relative imports:**
         - The test file **MUST** use '../../../src/...' instead of '@src/'.
         - Example:
           ✅ **Correct:**
           \`import { getPaymentRecordByIdNameUseCase } from '../../../src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`  
           ❌ **Incorrect:**
           \`import { getPaymentRecordByIdNameUseCase } from '@src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`

      2. **Ensure Jest resolves paths properly:**
         - The test **MUST** import modules using '../../../src/...' to match the actual project structure.
         - The test **MUST NOT** use Jest's 'moduleNameMapper'.

      3. **Fix 'right' does not exist error in fp-ts/Either:**
         - The test **MUST NOT** use 'result.right'. Instead, it **MUST** use 'E.getOrElse()' to extract values:
           - ✅ **Correct:**
             \'const paymentRecord = E.getOrElse<ApplicationError, PaymentRecordDto>(
                () => { throw new Error("Expected Right but got Left"); }
             )(result);\'
           - ❌ **Incorrect:**
             \'const paymentRecord = result.right;\'

      4. **Ensure Jest mocks dependencies correctly:**
         - The test **MUST** properly mock repository methods using Jest.
         - Example:
           \'jest.mock('../../../src/infrastructure/repositories/paymentRecordRepositoryMySQL');\'
         - This ensures Jest correctly isolates repository logic.
           '''

      **Final Note:**
      - The generated test file **MUST** run successfully in a TypeScript project using Jest.
      - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

      NOW, GENERATE THE TEST.
    `
```

### Explanation

- The prompt is **strictly structured** to ensure that OpenAI follows **Jest** and **fp-ts/Either** patterns.
- It **provides the files code** so OpenAI can generate relevant tests.
- **It enforces complete coverage**, including **success and failure scenarios**.
- The output is **pure TypeScript code**, with **no comments or extra text** to keep it clean.

---

## Step 14: Sending API Requests to OpenAI for Integration Test

```typescript
const integrationResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "developer", content: integrationPrompt }],
  max_tokens: 4000,
  temperature: 0.0,
  top_p: 0.0,
  frequency_penalty: 0,
  presence_penalty: 0,
})
```

### Explanation

- This sends the **integration test prompt** to OpenAI’s **GPT-4o** model.
- The model is instructed to **return only valid TypeScript Jest code**.
- **max_tokens: 4000** ensures the response is long enough to cover all scenarios.

---

## Step 15: Saving the Generated Integration Test

```typescript
if (integrationResponse?.choices?.[0]?.message?.content) {
      const filePath = path.join(testOutputDir, "integration", fileName)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, integrationResponse.choices[0].message.content.trim(), { encoding: "utf8" })
      console.log(`✅ Generated Integration Test: ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error generating tests for ${fileName}:`, error)
  }
```

### Explanation

- **Checks if OpenAI returned a valid response**.
- Constructs the **file path** for the integration test.
- **Creates the directory if it doesn't exist**.
- **Writes the generated test to a file**.

---

## Step 16: Creating a Unit Test Prompt

```typescript
const unitPrompt = `
    STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

    Given the following TypeScript files:

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

    **Route:**
    \`\`\`typescript
    ${routeCode}
    \`\`\`

    YOU MUST GENERATE a **Complete and exhaustive unit test consisting of a minimum of 20 test cases, focusing only on the Use Case file.** in TypeScript.

    **MANDATORY REQUIREMENTS (DO NOT IGNORE ANY):**
    - The test **MUST** be written using **Jest** as the testing framework.
    - The test **MUST** use **fp-ts/Either** for handling errors.
    - The test **MUST** use **fp-ts/Option** for handling optional values.
    - **The Repository MUST be properly mocked** to isolate dependencies.
    - **ALL POSSIBLE CASES, including both SUCCESS and FAILURE scenarios, MUST be covered completely.**
    - **DO NOT SKIP ANY CONTENTS OR EDGE CASES.**
    - **DO NOT wrap the output inside code blocks like \`\`\`typescript**.
    - **The output MUST ONLY contain valid TypeScript Jest test code—NO COMMENTS, NO EXPLANATIONS, NO EXTRA TEXT.**
    - **FAILURE TO FOLLOW THESE INSTRUCTIONS WILL BE CONSIDERED AN ERROR.**

    **ADDITIONAL MANDATORY FIXES TO AVOID COMMON ERRORS:**
    1. **Fix 'Cannot find module' errors by enforcing correct relative imports:**
        - The test file **MUST** use '../../../src/...' instead of '@src/'.
        - Example:
        ✅ **Correct:**
        \`import { getPaymentRecordByIdNameUseCase } from '../../../src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`  
        ❌ **Incorrect:**
        \`import { getPaymentRecordByIdNameUseCase } from '@src/application/use_cases/paymentRecord/getPaymentRecordByIdNameUseCase';\`

    2. **Ensure Jest resolves paths properly:**
        - The test **MUST** import modules using '../../../src/...' to match the actual project structure.
        - The test **MUST NOT** use Jest's 'moduleNameMapper'.

    3. **Fix 'right' does not exist error in fp-ts/Either:**
        - The test **MUST NOT** use 'result.right'. Instead, it **MUST** use 'E.getOrElse()' to extract values:
        - ✅ **Correct:**
            \'const paymentRecord = E.getOrElse<ApplicationError, PaymentRecordDto>(
                () => { throw new Error("Expected Right but got Left"); }
            )(result);\'
        - ❌ **Incorrect:**
            \'const paymentRecord = result.right;\'

    4. **Ensure Jest mocks dependencies correctly:**
        - The test **MUST** properly mock repository methods using Jest.
        - Example:
        \'jest.mock('../../../src/infrastructure/repositories/paymentRecordRepositoryMySQL');\'
        - This ensures Jest correctly isolates repository logic.
        '''

    **Final Note:**
    - The generated test file **MUST** run successfully in a TypeScript project using Jest.
    - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

    NOW, GENERATE THE TEST.
    `
```

### Explanation

- This prompt is similar to the **integration test prompt**, but it focuses on **unit testing**.
- The tests must **fully cover success and failure scenarios**.

---

## Step 17: Sending API Requests to OpenAI for Unit Test

```typescript
const unitResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "developer", content: unitPrompt }],
  max_tokens: 14000,
  temperature: 0.0,
  top_p: 0.0,
  frequency_penalty: 0,
  presence_penalty: 0,
})
```

### Explanation

- This sends the **unit test prompt** to OpenAI’s **GPT-4o** model.
- The model is instructed to **return only valid TypeScript Jest code**.
- **max_tokens: 4000** ensures the response is long enough to cover all scenarios.

---

## Step 18: Saving the Generated Unit Test

```typescript
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
```

### Explanation

- **Checks if OpenAI returned a valid response**.
- Constructs the **file path** for the unit test.
- **Creates the directory if it doesn't exist**.
- **Writes the generated test to a file**.

### Step 19: Generate All Tests

```typescript
async function generateAllTests() {
  for (const { name, controller, useCase, repo, port, entity, dto, route } of detectedTestFiles) {
    console.log(`Generating test for: ${name}`)
    console.log(`  Controller: ${controller}`)
    console.log(`  Use Case: ${useCase}`)
    console.log(`  Repository: ${repo}`)
    console.log(`  Port: ${port}`)
    console.log(`  Entity: ${entity}`)
    console.log(`  DTO: ${dto}`)
    console.log(`  Route: ${route}`)
    await generateTest(
      name,
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
```

- Iterates over detected test files and generates tests for each.

---

### Step 20: Start Test Generation

```typescript
generateAllTests()
```

- **Runs the entire process**, automatically generating tests.

## Running the Script

To execute the test generation process, run:

```sh
yarn test:generate
```

OR

```sh
npm test:generate
```

This will generate test files automatically and store them in the `test/test4o/` directory.

## Note

- Please review the generated testcases for correctness and completeness.
- If any issues are found, adjust the test generation process accordingly.
