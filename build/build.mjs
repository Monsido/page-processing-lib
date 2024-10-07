import esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import fs from 'fs';

// Function to clean the dist directory
function cleanDist() {
    const distPath = resolve('./dist');
    if (existsSync(distPath)) {
        rmSync(distPath, { recursive: true, force: true });
    }
    mkdirSync(distPath);
}

function syncPackageVersion() {
    const packageJsonPath = resolve('./package.json');
    const infoJsonPath = resolve('./src/info.json');

    if (existsSync(infoJsonPath) && existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const infoJson = JSON.parse(readFileSync(infoJsonPath, 'utf8'));
        infoJson.version = packageJson.version;
        writeFileSync(infoJsonPath, JSON.stringify(infoJson, null, 2), 'utf8');
        console.info('Version updated in info.json to', infoJson.version);
    } else {
        console.info('Could not resolve paths');
    }
}

// Call the function to update the version
syncPackageVersion();
// Clean the dist directory
cleanDist();
// Run TypeScript compiler to generate type definitions
execSync('tsc --project tsconfig.json', { stdio: 'inherit' });

// Run esbuild to bundle the library
const commonSettings = {
    minify: true,
};
const esmSettings = createBuildSettings({
    ...commonSettings,
    outfile: 'dist/index.js',
    format: 'esm',
});
const cjsSettings = createBuildSettings({
    ...commonSettings,
    outfile: 'dist/index.csj.js',
    format: 'cjs',
});
esbuild.build(esmSettings).catch(() => process.exit(1));
esbuild.build(cjsSettings).catch(() => process.exit(1));
