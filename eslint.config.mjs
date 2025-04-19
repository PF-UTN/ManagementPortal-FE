import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.strict,
  {
    ignores: ['**/*.{js, mjs, cjs}', 'dist/**', 'node_modules/**'],
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'import/order': [
        'error',
        {
          groups: [['internal'], ['external'], ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
      'newline-per-chained-call': [
        'error',
        {
          ignoreChainWithDepth: 1,
        },
      ],
      indent: [
        'error',
        2,
        {
          MemberExpression: 1,
        },
      ],
    },
  },
];
