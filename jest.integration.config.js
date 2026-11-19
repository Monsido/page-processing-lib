module.exports = {
    globalSetup: './integration-tests/puppeteer-config/setup.js',
    globalTeardown: './integration-tests/puppeteer-config/teardown.js',
    testEnvironment: './integration-tests/puppeteer-config/puppeteer-env.js',
    preset: 'ts-jest/presets/js-with-ts',
    testMatch: ['<rootDir>/integration-tests/**/*.spec.ts'], // Match spec files
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        // pixelmatch is ESM-only, so it has to be transpiled to CommonJS as well
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: { allowJs: true } }],
    },
    transformIgnorePatterns: ['/node_modules/(?!pixelmatch/)'],
};
