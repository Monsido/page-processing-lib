export function createBuildSettings(options) {
    return {
        entryPoints: ['./src/index.ts'],
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        format: 'cjs', // Output format is ES module
        bundle: true,
        ...options,
    };
}
