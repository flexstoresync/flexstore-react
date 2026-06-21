import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['react', '@flexstore/core'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
