import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended, // Base ESLint rules
  {
    languageOptions: {
      globals: globals.node, // Enable Node.js globals
    },
    rules: {
      'prettier/prettier': 'error', // Use Prettier for formatting
    },
    plugins: {
      prettier,
    },
  },
];
