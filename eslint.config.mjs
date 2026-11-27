// Flat config (ESLint 9). Replaces the old .eslintrc, whose parser (babel-eslint)
// and presets (standard, standard-react) were never declared and no longer exist
// for ESLint 9. Formatting is left to prettier (`npm run format`), so this config
// only carries the recommended correctness rules.
//
// CI's blocking check is the shared correctness lint of openimis-fe_js
// (lint/eslint.config.mjs); this one is for editors and `npm run lint`.
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{js,jsx,mjs}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      // `process.env.*` is replaced by vite's `define` at build time.
      globals: { ...globals.browser, ...globals.es2021, process: "readonly" },
    },
    settings: { react: { version: "19" } },
    rules: {
      // Components document their props in JSDoc, not prop-types.
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Legacy debt across the module (about 370 hits): reported, not failing,
      // until it is cleaned up. Promote back to error once src/ is clean.
      "no-unused-vars": "warn",
      "no-extra-boolean-cast": "warn",
      "no-prototype-builtins": "warn",
      "no-useless-escape": "warn",
    },
  },
  {
    files: ["vite.config.js", "eslint.config.mjs"],
    languageOptions: { globals: globals.node },
  },
];
