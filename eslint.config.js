const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAnyKeyword',
          message: 'Do not use `as any`. Use a narrow type, a type guard, `unknown` with validation, or fix the public contract.',
        },
        {
          selector: 'TSTypeAssertion > TSAnyKeyword',
          message: 'Do not use `<any>`. Use a narrow type, a type guard, `unknown` with validation, or fix the public contract.',
        },
      ],
    },
  }
);

