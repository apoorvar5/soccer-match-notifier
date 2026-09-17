import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { existsSync, copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  base: '',
  plugins: [
    react(),
    {
      name: 'copy-extension-assets',
      closeBundle() {
        // Copy manifest.json and icons to dist
        const distDir = resolve(__dirname, 'dist');
        const srcManifest = resolve(__dirname, 'src/manifest.json');
        const distManifest = resolve(distDir, 'manifest.json');
        if (existsSync(srcManifest)) {
          copyFileSync(srcManifest, distManifest);
        }

        const iconsDir = resolve(__dirname, 'public/icons');
        const distIconsDir = resolve(distDir, 'icons');
        if (!existsSync(distIconsDir)) {
          mkdirSync(distIconsDir, { recursive: true });
        }
        if (existsSync(iconsDir)) {
          ['icon16.png', 'icon48.png', 'icon128.png'].forEach(file => {
            const src = resolve(iconsDir, file);
            if (existsSync(src)) {
              copyFileSync(src, resolve(distIconsDir, file));
            }
          });
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
