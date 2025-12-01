import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: 'electron/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.cjs',
    },
    outDir: 'dist-electron',
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        'simple-git',
        'adm-zip',
        'axios'
      ],
    },
    emptyOutDir: true,
    minify: false,
  },
});
