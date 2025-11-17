import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'line/index': 'src/line/index.ts',
    'bar/index': 'src/bar/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'd3',
    '@beaubrain/chart-lib-core',
    '@beaubrain/chart-lib-types'
  ],
  treeshake: true,
  target: 'es2020',
  outDir: 'dist'
});