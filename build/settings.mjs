export function createBuildSettings(options) {
    return {
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        format: 'esm',
        bundle: true,
        ...options,
    };
}
