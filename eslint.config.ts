import eslint from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import nodePlugin from "eslint-plugin-n";
import yml from "eslint-plugin-yml";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist", ".worktrees"],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  {
    files: ["**/*.js"],
    extends: [eslint.configs.recommended],
  },
  {
    files: ["**/*.{js,ts}"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-unsupported-features/es-builtins": [
        "error",
        { version: ">=22.14.0" },
      ],
      "n/no-unsupported-features/es-syntax": [
        "error",
        { version: ">=22.14.0" },
      ],
      // Node.js 22.14 supports import.meta.dirname, which eslint-plugin-n marks unsupported until Node.js 22.16.
      "n/no-unsupported-features/node-builtins": [
        "error",
        { version: ">=22.14.0", ignores: ["import.meta.dirname"] },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        onUnsupportedTypeScriptVersion: "error",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unsafe-type-assertion": "error",
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["tsconfig*.json", "**/tsconfig*.json"],
    plugins: {
      json,
    },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["tsconfig*.json", "**/tsconfig*.json"],
    plugins: {
      json,
    },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: {
      markdown,
    },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.{yaml,yml}"],
    plugins: {
      yml,
    },
    extends: ["yml/recommended"],
  },
  {
    files: [".github/workflows/**/*.{yaml,yml}"],
    rules: {
      "yml/no-empty-mapping-value": "off",
    },
  },
);
