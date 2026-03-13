import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT ?? '7422', 10),
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
