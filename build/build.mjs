import esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
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
const defaultSettings = {
    minify: true,
    outfile: 'dist/index.js',
};

const settings = process.env.BUILD_FORMAT_CJS
    ? createBuildSettings({
          ...defaultSettings,
          format: `${process.env.BUILD_FORMAT_CJS}`,
      })
    : createBuildSettings({
          ...defaultSettings,
      });
esbuild.build(settings);
