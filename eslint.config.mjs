import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.strict,
  {
    ignores: ['**/*.{js, mjs, cjs}', "dist/**", "node_modules/**"],
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
          groups: [
            ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          ],
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
    },
  },
];