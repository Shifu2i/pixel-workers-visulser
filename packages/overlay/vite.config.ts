import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: parseInt(process.env.PORT ?? '7422', 10),
    open: false,
  },
  preview: {
    host: true,
    port: parseInt(process.env.PORT ?? '7422', 10),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
