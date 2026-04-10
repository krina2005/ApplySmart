import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to FastAPI backend during local development
    proxy: {
      '/analyze-resume': 'http://localhost:8000',
      '/rank-resumes':   'http://localhost:8000',
      '/rank-job':       'http://localhost:8000',
    }
  }
})
