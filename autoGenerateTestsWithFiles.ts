// Step 1: Importing Required Modules
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Step 2: Loading Environment Variables
dotenv.config()

// Step 3: Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
})

// Step 4: Define Test Output Directory
const testOutputDir = path.join(__dirname, "./test/test4o")

// Step 5: Ensure Test Directory Exists
fs.mkdirSync(testOutputDir, { recursive: true })

// Step 6: Resolve absolute path for the files
const resolvePath = (filePath: string): string => path.resolve(__dirname, filePath)
console.log()

// Step 7: Check if the file exists
const checkFileExistence = (filePath: string, fileType: string) => {
  const resolvedPath = resolvePath(filePath)
  console.log(`Checking if ${fileType} exists: ${resolvedPath}`)
  if (fs.existsSync(resolvedPath)) {
    console.log(`✅ ${fileType} exists: ${resolvedPath}`)
  } else {
    console.warn(`⚠️ ${fileType} not found: ${resolvedPath}`)
  }
}

// Step 8: Read File Content with Logging
const readFileContent = (filePath: string, fileType: string): string | null => {
  checkFileExistence(filePath, fileType)
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    console.warn(`⚠️ Error reading ${fileType} - ${filePath}`)
    return null
  }
}

// Step 9: Function to Generate Test Cases
async function generateTest(fileName: string, apiEndPoint: string, controllerPath: string, useCasePath: string, repositoryPortPath: string, repositoryPath: string) {
  const controllerCode = readFileContent(controllerPath, "Controller")
  const useCaseCode = readFileContent(useCasePath, "Use Case")
  const repositoryPortCode = readFileContent(repositoryPortPath, "Repository Port")
  const repositoryCode = readFileContent(repositoryPath, "Repository")

  console.log(`📝 Checking: ${fileName}`)
  console.log(`  🔹 Controller: ${controllerPath} → Exists? ${controllerCode ? "Yes" : "No"}`)
  console.log(`  🔹 Use Case: ${useCasePath} → Exists? ${useCaseCode ? "Yes" : "No"}`)

  if (!apiEndPoint || !controllerCode || !useCaseCode) {
    console.error(`❌ Skipping test generation for ${fileName} due to missing files.`)
    return
  }

  // Step 10: Creating a Integration Test Prompt
  const integrationPrompt = `
      STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

      Given the following TypeScript files:

      **ApiEndPoint:**
      \`\`\`typescript
      ${apiEndPoint}
      \`\`\`

      **Controller:**
      \`\`\`typescript
      ${controllerCode}
      \`\`\`

      **Use Case:**
      \`\`\`typescript
      ${useCaseCode}
      \`\`\`

      **Repository Port:**
      \`\`\`typescript
      ${repositoryPortCode}
      \`\`\`

      **Repository:**
      \`\`\`typescript
      ${repositoryCode}
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

      **Final Note:**
      - The generated test file **MUST** run successfully in a TypeScript project using Jest.
      - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

      NOW, GENERATE THE TEST.
    `

  try {
    // Step 11: Sending API Requests to OpenAI for Integration Test
    const integrationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "developer", content: integrationPrompt }],
      max_tokens: 4000,
      temperature: 0.0,
      top_p: 0.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    // Step 12: Saving the Generated Integration Test
    if (integrationResponse?.choices?.[0]?.message?.content) {
      const filePath = path.join(testOutputDir, "integration", fileName)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, integrationResponse.choices[0].message.content.trim(), { encoding: "utf8" })
      console.log(`✅ Generated Integration Test: ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error generating tests for ${fileName}:`, error)
  }

  // Step 13: Creating a Unit Test Prompt
  const unitPrompt = `
    STRICTLY FOLLOW THE INSTRUCTIONS BELOW WITHOUT EXCEPTION:

    Given the following TypeScript files:

    **ApiEndPoint:**
    \`\`\`typescript
    ${apiEndPoint}
    \`\`\`

    **Controller:**
    \`\`\`typescript
    ${controllerCode}
    \`\`\`

    **Use Case:**
    \`\`\`typescript
    ${useCaseCode}
    \`\`\`

    **Repository Port:**
    \`\`\`typescript
    ${repositoryPortCode}
    \`\`\`

    **Repository:**
    \`\`\`typescript
    ${repositoryCode}
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

    **Final Note:**
    - The generated test file **MUST** run successfully in a TypeScript project using Jest.
    - **STRICTLY FOLLOW THESE INSTRUCTIONS OR THE OUTPUT WILL BE CONSIDERED INCORRECT.**

    NOW, GENERATE THE TEST.
    `

  try {
    // Step 14: Sending API Requests to OpenAI for Unit Test
    const unitResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "developer", content: unitPrompt }],
      max_tokens: 14000,
      temperature: 0.0,
      top_p: 0.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    // Step 15: Saving the Generated Unit Test
    if (unitResponse?.choices?.[0]?.message?.content) {
      const unitFilePath = path.join(testOutputDir, "unit", fileName)
      fs.mkdirSync(path.dirname(unitFilePath), { recursive: true })
      fs.writeFileSync(unitFilePath, unitResponse.choices[0].message.content.trim(), { encoding: "utf8" })
      console.log(`✅ Generated Unit Test: ${unitFilePath}`)
    }
  } catch (error) {
    console.error(`❌ Error generating unit tests for ${fileName}:`, error)
  }
}

// Step 16: Manually Define Files to Generate Tests For
const filesToGenerateTestsFor = [
  // basicChargePlanSummary
  {
    fileName: "basicChargePlanSummary.test.ts",
    apiEndPoint: "/basic-charge/plan/summary",
    controllerPath:
      "C:/Users/INFINIX/OneDrive/Documents/PTM-BE/PTM-BE/src/interface/controllers/dpm/KPI003/getBasicChargePlanSummaryController.ts",
    useCasePath:
      "C:/Users/INFINIX/OneDrive/Documents/PTM-BE/PTM-BE/src/application/use_cases/dpm/getBasicChargePlanSummaryUsecase.ts",
    repositoryPortPath:
      "C:/Users/INFINIX/OneDrive/Documents/PTM-BE/PTM-BE/src/application/port/BasicChargeRepositoryPort.ts",
    repositoryPath:
      "C:/Users/INFINIX/OneDrive/Documents/PTM-BE/PTM-BE/src/infrastructure/repositories/dpm/BasicChargeRepositorySequelizeMySQL.ts",
  },

  // Add more files as needed
]

// Step 17: Start Test Generation
filesToGenerateTestsFor.forEach((file) =>
  generateTest(file.fileName, file.apiEndPoint, file.controllerPath, file.useCasePath, file.repositoryPortPath, file.repositoryPath),
)
