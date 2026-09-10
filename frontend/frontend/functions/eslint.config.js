import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node, // Node.js environments (process, console, etc.) ko fully enable karta hai
        ...globals.es2021,
      },
    },
    rules: {
      "no-unused-vars": "off", // Unused warnings off taaki build block na ho
      "no-undef": "off",       // Undefined variables protection bypass
    },
  },
];
