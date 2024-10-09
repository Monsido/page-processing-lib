module.exports = {
    globalSetup: './integration-tests/puppeteer-config/setup.js',
    globalTeardown: './integration-tests/puppeteer-config/teardown.js',
    testEnvironment: './integration-tests/puppeteer-config/puppeteer-env.js',
    preset: 'ts-jest',
    testMatch: ['**/*.integration.spec.ts'], // Match spec files
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
