module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
      'semi': ['error', 'always'],
      /** TODO: fix to error instead of warn */
      //'cypress/no-unnecessary-waiting': 'warn',
      //"no-console": ["error", { allow: ["warn", "error"] }],     
      // "quotes": ["error", "single"]
      'no-undef': ['off'],
      'no-unused-vars': ['off'],
      // ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }]
      'no-explicit-any': 'off'
      //'no-console': 'error'
  }
};