import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    rules: {
      'max-lines': ['error', { 'max': 300, 'skipBlankLines': true, 'skipComments': true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
  {
    ignores: ['node_modules/', 'newtab.js', 'dist/', 'build/'],
  }
);
