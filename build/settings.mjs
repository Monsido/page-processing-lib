export function createBuildSettings(options) {
    console.log('options', options);
    return {
        entryPoints: ['./src/index.ts'],
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        bundle: true,
        ...options,
    };
}
