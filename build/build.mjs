import esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, copyFileSync } from 'fs';
import { resolve } from 'path';

// Function to clean the dist directory
function cleanDist() {
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
    entryPoints: ['./src/index.ts'],
};
const esmSettings = createBuildSettings({
    ...commonSettings,
    format: 'esm',
    outfile: 'dist/index.js',
});
const cjsSettings = createBuildSettings({
    ...commonSettings,
    format: 'cjs',
    outfile: 'dist/index.cjs.js',
});
esbuild.build(esmSettings).catch(() => process.exit(1));
esbuild.build(cjsSettings).then(
    () => {
        // copy index.d.ts from src to dist
        const declarationPath = resolve('./dist/src/index.d.ts');

        if (existsSync(declarationPath)) {
            copyFileSync(declarationPath, './dist/index.cjs.d.ts');
        }
    }
).catch(() => process.exit(1));
