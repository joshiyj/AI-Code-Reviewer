import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ai': {
        target: 'https://ai-code-reviewer-backend-cfbn.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
