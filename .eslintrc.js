/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ['**/**/*.generated.ts', '*.js'],
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended',
  ],
  plugins: ['no-relative-import-paths', 'formatjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'formatjs/enforce-description': ['error', 'literal'],
    'formatjs/no-offset': 'error',
    'formatjs/enforce-default-message': ['error', 'literal'],
    '@typescript-eslint/no-shadow': ['error', { ignoreOnInitialization: true }],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowAny: true, allowNumber: true, allowBoolean: false, allowNullish: false },
    ],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
  },
}