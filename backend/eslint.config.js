const eslint = require('@eslint/js');
const globals = require('globals');

module.exports = [
  eslint.configs.recommended,
  {
    ignores: ['coverage/**', 'logs/**', 'node_modules/**'],
  },
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['tests/**/*.js', 'jest.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
    },
  },
];
