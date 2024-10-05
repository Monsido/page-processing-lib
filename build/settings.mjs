export function createBuildSettings(options) {
    return {
        entryPoints: ['./src/index.ts'],
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        bundle: true,
        ...options,
    };
}
