# Automated Test File Generation

## Overview

This script automates the creation of **integration tests** (using **Mocha**, **Chai**, and **Supertest**) and **unit tests** (using **Mocha** and **Chai**) for a Node.js TypeScript project. It scans project directories for controllers, maps them to their corresponding use cases and repositories, and then uses **OpenAI’s GPT-4o** model to generate the test files. It also ensures database state management using **Sequelize transactions** in integration tests.

## Features

- **Automated Detection**: Recursively scans directories to locate controllers, use cases, repositories, DTOs, and routes.
- **Mocha & Chai**: Uses Mocha as the test runner, and Chai for assertions in both unit and integration tests.
- **Supertest**: Integration tests leverage Supertest to simulate HTTP requests against the Express app.
- **Sequelize Transactions**: Manages database state during integration tests using Sequelize transactions.
- **Comprehensive Coverage**: Generates a minimum of 20 test cases per category (integration and unit), covering both success and failure scenarios for each controller and use case.

## Directory Structure

Below is a simplified view of how the project might be organized:

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
│   └── controllers/
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
test/
└── test4o/
  ├── integration/
  ├── unit/
.env
package.json
autoGenerateTests.ts (this script)
```
Within `test/test4o/`, two subdirectories are created automatically during test generation:

- `test/test4o/integration`  
- `test/test4o/unit`

## Installation

First, install the required dependencies:

```sh
npm install openai dotenv fs path mocha chai supertest sequelize
```

Make sure to include the following in your `.env` file (located in your project’s root directory) for the OpenAI API key:

```sh
OPENAI_API_KEY=your_openai_api_key
```

> **Note**: You may also need additional Sequelize libraries (e.g., `pg`, `mysql2`, etc.) depending on your chosen database.

## Script Creation

### Explanation of the Code

This script programmatically:

1. **Loads environment variables** (for OpenAI key, etc.).
2. **Initializes the OpenAI client** (with GPT-4o).
3. **Scans** the project’s `controllers` directory for `.ts` files.
4. **Maps** each controller to a corresponding **use case**, **repository**, **port**, **entity**, and **route** based on a custom configuration.
5. **Generates prompts** for GPT-4o to create integration and unit tests, using Mocha, Chai, Supertest, and Sequelize transactions where appropriate.
6. **Writes** the generated tests (as `.test.ts` files) to a `test/test4o/` directory, separated into `integration` and `unit` folders.

---

### Step-by-Step Breakdown

#### Step 1: Importing Required Modules

```typescript
import OpenAI from "openai"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
```

- **OpenAI**: Interacts with OpenAI’s GPT-4o model.
- **fs**: Reads and writes files.
- **path**: Handles paths across different operating systems.
- **dotenv**: Loads sensitive environment variables from a `.env` file.

---

#### Step 2: Load Environment Variables

```typescript
dotenv.config()
```

- Loads `.env` configuration to populate environment variables (e.g., your OpenAI API key).

---

#### Step 3: Initialize OpenAI API

```typescript
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
})
```

- Initializes an instance of OpenAI using the loaded API key.

---

#### Step 4: Define Paths to Different Files

```typescript
const controllersDir = path.join(__dirname, "./src/interface/controllers/dpm")
const useCasesDir = path.join(__dirname, "./src/application/use_cases/dpm")
const repositoriesDir = path.join(__dirname, "./src/infrastructure/repositories/dpm")
const portDir = path.join(__dirname, "./src/application/port")
const entityDir = path.join(__dirname, "./src/infrastructure/orm/typeorm/entities")
const dtoDir = path.join(__dirname, "./src/domain")
const routeDir = path.join(__dirname, "./src")
```

- Identifies the key folders for **controllers**, **use cases**, **repositories**, **ports**, **entities**, **DTOs**, and **routes**.

---

#### Step 5: Define Test Output Directory

```typescript
const testOutputDir = path.join(__dirname, "./test/test4o")
```

- Sets up the output folder where generated test files will be stored.

---

#### Step 6: Ensure Test Directory Exists

```typescript
fs.mkdirSync(testOutputDir, { recursive: true })
```

- Creates `./test/test4o` if it doesn’t already exist.

---

#### Step 7: Recursively Get All TypeScript Files

```typescript
const getAllTsFiles = (dir: string): string[] => { ... }
```

- Recursively searches a directory for `.ts` files, accumulating them into an array.

---

#### Step 8: Detect Controller Files

```typescript
const detectedControllers = getAllTsFiles(controllersDir)
```

- Collects all `.ts` files from the `controllersDir` directory.

---

#### Step 9: Define the Mapping Between Use Cases and Their Corresponding Files

```typescript
function getFileMapping(): Record<string, {...}> {
  return {
    getBasicChargePlan: {
      apiPath: "GET /basic-charge/plan",
      repoName: "getBasicChargePlan",
      useCase: "getBasicChargePlanUsecase.ts",
      repo: ["BasicChargeRepositorySequelizeMySQL.ts"],
      port: ["BasicChargeRepositoryPort.ts"],
      entity: [],
      dto: "entities/dpm/basicChargePlan.ts",
      route: "infrastructure/webserver/express/basicChargeRoutes.ts",
    },
    ...
  }
}
```

- Creates a configuration object mapping a **controller base name** to its **API path**, **repository name**, **use case filename**, **repository** files, **port**, **entity**, **DTO**, and **route**.

---

#### Step 10: Generate the List of Test Files Corresponding to Detected Controllers

```typescript
const detectedTestFiles = detectedControllers.map((controllerPath) => {
  // derive base name, locate mapping, check file existence, etc.
  return {
    name: `${baseName}.test.ts`,
    apiPath: files.apiPath,
    controller: controllerFile,
    useCase: useCaseExists ? files.useCase : null,
    ...
  }
})
```

- Determines which files exist for each controller (use case, repo, port, entity, etc.).
- Logs out the status.

---

#### Step 11: Read File Content Safely

```typescript
const readFileContent = (filePath: string): string | null => { ... }
```

- Attempts to read the content of a file.
- Returns `null` with a warning if the file doesn’t exist.

---

#### Step 12: Function to Generate the Test Cases by Sending the Prompt to OpenAI API

```typescript
async function generateTest(
  fileName: string,
  apiPath: string,
  ...
) {
  // ...
  if (!controllerCode || !useCaseCode || !repositoryCode || !routeCode) {
    console.error(`❌ Skipping test generation...`)
    return
  }
  // ...
}
```

- Orchestrates reading the relevant files (controller, use case, repository, etc.) and checking for presence.
- Prepares the final test prompts for the **integration** and **unit** tests.

---

#### Step 13: Creating an Integration Test Prompt

```typescript
const integrationPrompt = `
  STRICTLY FOLLOW THE INSTRUCTIONS BELOW...
  YOU MUST GENERATE a complete and exhaustive integration API test...
  - Test MUST be written using Mocha, Chai, and Supertest
  - Use Sequelize transactions...
  ...
`
```

- Assembles a tightly controlled prompt instructing GPT-4o to produce **Mocha/Chai/Supertest** integration tests.
- Emphasizes correct relative imports, success & failure cases, etc.

---

#### Step 14: Sending API Requests to OpenAI for Integration Test

```typescript
const integrationResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "developer", content: integrationPrompt }],
  ...
})
```

- Calls the GPT-4o model to produce an integration test file.

---

#### Step 15: Saving the Generated Integration Test

```typescript
if (integrationResponse?.choices?.[0]?.message?.content) {
  fs.writeFileSync(filePath, integrationResponse.choices[0].message.content.trim())
  console.log(`✅ Generated Integration Test: ${filePath}`)
}
```

- Creates any necessary directories.
- Writes the generated integration test code to a new `.test.ts` file.

---

#### Step 16: Creating a Unit Test Prompt

```typescript
const unitPrompt = `
STRICTLY FOLLOW THE INSTRUCTIONS BELOW...
YOU MUST GENERATE a complete and exhaustive set of unit tests...
- Test MUST be written using Mocha, Chai
- Must mock external dependencies...
`
```

- Instructs GPT-4o to produce a unit test suite for the target **use case** only.

---

#### Step 17: Sending API Requests to OpenAI for Unit Test

```typescript
const unitResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "developer", content: unitPrompt }],
  ...
})
```

- Requests the GPT-4o model to generate the unit test code.

---

#### Step 18: Saving the Generated Unit Test

```typescript
if (unitResponse?.choices?.[0]?.message?.content) {
  fs.writeFileSync(unitFilePath, unitResponse.choices[0].message.content.trim())
  console.log(`✅ Generated Unit Test: ${unitFilePath}`)
}
```

- Writes the generated unit test suite to a `.test.ts` file in `test/test4o/unit/`.

---

#### Step 19: Generate All Tests

```typescript
async function generateAllTests() {
  for (const { name, apiPath, controller, useCase, ... } of detectedTestFiles) {
    await generateTest(name, apiPath, controller, useCase, ...)
  }
}
```

- Iterates over each discovered controller file, triggering generation of both **integration** and **unit** tests.

---

#### Step 20: Start Test Generation

```typescript
generateAllTests()
```

- Kicks off the entire process, producing tests for all found controllers and use cases.

## Running the Script

To run the entire test generation flow, simply execute:

```sh
npx ts-node path/to/your/script.js
```

Or, if you’ve set up a script in your `package.json`, something like:

```sh
npm run test:generate
```

This will generate Mocha/Chai/Supertest integration tests (with Sequelize transactions) and Mocha/Chai unit tests for each detected controller and use case under the `test/test4o` folder.

## Note

- Review and refine the generated test files as needed, especially if your project requires additional configuration for Sequelize, Mocha, Chai, or custom logic in your test environment.
- Make sure your environment supports TypeScript test execution (you may need [ts-node](https://www.npmjs.com/package/ts-node) or a similar setup).
- If the script doesn’t generate tests for a specific file (due to missing references or an incomplete mapping), update the **file mapping** in the script to ensure each controller is properly associated with its dependencies.