import typescriptEslint from "@typescript-eslint/eslint-plugin"
import { fixupPluginRules } from "@eslint/compat"
import importPlugin from "eslint-plugin-import"
import deprecation from "eslint-plugin-deprecation"
import parser from "@typescript-eslint/parser"
import eslintComments from "eslint-plugin-eslint-comments"
import prettier from "eslint-plugin-prettier"
import stylistic from "@stylistic/eslint-plugin"

export default [
  {
    ignores: ["build/"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
      deprecation: fixupPluginRules(deprecation),
      "eslint-comments": eslintComments,
      prettier: prettier,
      "@stylistic": stylistic,
    },
    rules: {
      "no-console": 1,
      "no-warning-comments": 1,
      "@stylistic/object-curly-spacing": ["error", "always", { arraysInObjects: true }],
      "@stylistic/line-comment-position": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "require-await": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "deprecation/deprecation": "error",
      "eslint-comments/no-unused-disable": 1,
      "import/extensions": [
        "error",
        "always",
        {
          ts: "always",
          tsx: "always",
          js: "never",
          jsx: "never",
        },
      ],
      "prettier/prettier": [
        "error",
        {
          semi: false,
          trailingComma: "all",
          printWidth: 120,
        },
      ],
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".ts"],
        },
      },
    },
  },
]
