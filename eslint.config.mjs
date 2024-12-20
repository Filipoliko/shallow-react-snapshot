// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import configPrettier from "eslint-config-prettier";
import pluginJest from "eslint-plugin-jest";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  // @ts-expect-error prettier config contains keys from unused plugins and it is causing an error in typing
  configPrettier,
  {
    files: ["**/*.test.*"],
    plugins: { jest: pluginJest },
    // Some rules are too strict for test files
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/__snapshots__/**"],
  },
);
