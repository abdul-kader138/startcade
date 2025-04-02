import parser from '@typescript-eslint/parser';

export default {
  parser: parser,
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
  }
};
