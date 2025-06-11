const isFixMode = process.argv.includes('--fix');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'xo',
    'xo-space',
    'xo-typescript',
    'prettier',
    'plugin:import/typescript',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['**/dist/*', '**/node_modules/*'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
    'unicorn',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'no-console': 'off',
    '@typescript-eslint/ban-types': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'unicorn/no-new-array': 'off',
    'unicorn/no-reduce': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        replacements: {
          props: false,
          args: false,
          params: false,
          env: false,
        },
      },
    ],
    'import/prefer-default-export': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-mutable-exports': 'error',
    'import/no-namespace': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-self-import': 'error',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['variable'],
        modifiers: ['const'],
        format: ['strictCamelCase', 'StrictPascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],
    'new-cap': 'off',
    // Custom rule to restrict @/ imports globally
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@/*'],
      },
    ],
    'unicorn/prefer-ternary': 'off',
  },
  settings: {
    'import/ignore': ['node_modules'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};
