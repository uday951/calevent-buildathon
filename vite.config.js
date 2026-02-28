import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://calevent-backend-xxzd.onrender.com',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/node_modules/**', 'D:/**/!(main_projects/calevent)/**']
    },
    fs: {
      strict: true,
      allow: ['..']
    }
  }
})