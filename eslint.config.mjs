import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: 
    { globals: globals.node },
    rules: {
      // Allow unused variables in catch clauses, variable name needs to start with "_"
      "no-unused-vars": [
        "error", 
        { 
          "argsIgnorePattern": "^_", // Ignore unused function arguments starting with "_"
          "caughtErrors": "all",     // Check all catch variables
          "caughtErrorsIgnorePattern": "^_" // Ignore unused catch variables starting with "_"
        }
      ]
    }
  },
  pluginJs.configs.recommended,
];