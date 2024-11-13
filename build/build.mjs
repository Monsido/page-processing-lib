import esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';

// Function to clean the dist directory
function cleanDist () {
    const distPath = resolve('./dist');
    if (existsSync(distPath)) {
        rmSync(distPath, { recursive: true, force: true });
    }
    mkdirSync(distPath);
}

// Clean the dist directory
cleanDist();
// Run TypeScript compiler to generate type definitions
execSync('tsc --project tsconfig.json', { stdio: 'inherit' });

// Run esbuild to bundle the library
const commonSettings = {
    minify: true,
};
const settings = createBuildSettings({
    ...commonSettings,
    outfile: 'dist/index.js',
    entryPoints: ['./src/index.ts'],
});
const scriptBuildSettings  = createBuildSettings({
    ...commonSettings,
    format: 'cjs',
    outfile: 'dist/index.script.js',
    entryPoints: ['./src/index.script.ts'],
});
esbuild.build(settings).catch(() => process.exit(1));
esbuild.build(scriptBuildSettings).catch(() => process.exit(1));
