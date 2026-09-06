import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const normalizedId = id.replace(/\\/g, '/');
            // Core React runtime ONLY (exact package matching to prevent bundling markdown/forms)
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/react-router/') ||
              normalizedId.includes('/node_modules/react-router-dom/') ||
              normalizedId.includes('/node_modules/react-helmet-async/')
            ) {
              return 'vendor-core';
            }
            if (normalizedId.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (normalizedId.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (normalizedId.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              normalizedId.includes('mermaid') ||
              normalizedId.includes('cytoscape') ||
              normalizedId.includes('dagre') ||
              normalizedId.includes('katex')
            ) {
              return 'vendor-diagrams';
            }
            if (
              normalizedId.includes('react-markdown') ||
              normalizedId.includes('remark-') ||
              normalizedId.includes('rehype-') ||
              normalizedId.includes('highlight.js')
            ) {
              return 'vendor-markdown';
            }
            if (normalizedId.includes('sql.js')) {
              return 'vendor-sql';
            }
          }
        },
      },
    },
  },
})
