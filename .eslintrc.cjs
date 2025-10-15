module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    plugins: ['react', 'react-hooks'],
    settings: { react: { version: 'detect' } },
    rules: {
        'react/prop-types': 'off',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'react/react-in-jsx-scope': 'off'
    },
    ignorePatterns: ['node_modules/', 'dist/', 'build/', '.vite/', 'vitest.checklist-reporter.js']
};
