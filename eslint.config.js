/** @type {import("eslint").FlatConfig.ConfigArray} */
const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const prettier = require("eslint-plugin-prettier");

module.exports = [
  js.configs.recommended,
  {
    ignores: ["eslint.config.js", "node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
      globals: {
        window: true,
        document: true,
        fetch: true,
        setTimeout: true,
        clearTimeout: true,
        NodeJS: true,
        process: true,
        console: true,
        require: true,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      react,
      prettier,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
    settings: {
      react: {
        version: "detect",
        pragma: "React",
        fragment: "Fragment",
      },
    },
  },
];
