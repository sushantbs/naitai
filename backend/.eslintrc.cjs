module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
}
