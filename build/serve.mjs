import esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';

const settings = createBuildSettings({ 
  sourcemap: true,
  banner: {
    js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
  },
  outfile: 'www/bundle.js',
});

const ctx = await esbuild.context(settings);

await ctx.watch();

const { host, port } = await ctx.serve({
  port: 5000,
  servedir: 'www',
  fallback: 'index.html',
});

console.log(`Serving app at http://localhost:${port}.`);