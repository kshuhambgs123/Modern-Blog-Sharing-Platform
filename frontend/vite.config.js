import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
      '/uploads': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
})
