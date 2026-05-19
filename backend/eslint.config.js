const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.es2022 },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'smart'],
      'prefer-const': 'warn',
    },
  },
  {
    files: ['tests/**/*.{js,mjs}', '**/*.test.{js,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['prisma/seed.js'],
    rules: { 'no-console': 'off' },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
];
