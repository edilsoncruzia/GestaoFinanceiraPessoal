import globals from 'globals';

export default [
  { ignores: ['dist/**', 'dist-ssr/**', 'pacote-design-v3/**', 'supabase/.temp/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
    },
  },
];
