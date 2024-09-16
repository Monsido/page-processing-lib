/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const { execSync } = require('child_process');
const { existsSync, mkdirSync, rmSync } = require('fs');
const { resolve } = require('path');


// Function to clean the dist directory
function cleanDist () {
    const distPath = resolve(__dirname, 'dist');
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
esbuild.build({
    entryPoints: ['./src/index.ts'], // Replace with your entry file
    bundle: true,
    outfile: 'dist/bundle.js', // Replace with your desired output file
    format: 'iife', // Bundle into an IIFE
    target: 'es2023', // Set the target to ES2023
    platform: 'node', // Bundle for Node.js
    minify: true, // Optional: minify the output
    sourcemap: true, // Optional: generate source maps
    loader: { '.ts': 'ts' }, // Use TypeScript loader
}).catch(() => process.exit(1));
