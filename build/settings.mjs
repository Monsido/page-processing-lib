export function createBuildSettings(options) {
    return {
        tsconfig: 'tsconfig.json',
        loader: { '.ts': 'ts' }, // Use TypeScript loader
        bundle: true,
        ...options,
    };
}
