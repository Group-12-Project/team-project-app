import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': process.env.PROFILE_API_TARGET || 'http://127.0.0.1:3001' } },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    clearMocks: true,
    testTimeout: 10000,
  },
})

