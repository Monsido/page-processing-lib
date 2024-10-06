export function createBuildSettings(options) {
    console.log('options', options);
    return {
        entryPoints: ['./src/index.ts'],
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        format: 'esm', // Output format is ES module
        bundle: true,
        ...options,
    };
}
