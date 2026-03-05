// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',           // autoriser any
    '@typescript-eslint/no-unsafe-call': 'warn',          // warnings pour appels non sûrs
    '@typescript-eslint/no-unsafe-assignment': 'warn',    // warnings pour assignations non sûres
    '@typescript-eslint/no-floating-promises': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};
