module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['prettier'],
  parser: '@babel/eslint-parser',
  rules: {
    'no-constant-condition': 'off',
    'no-unused-vars': 'warn',
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
  },
};
