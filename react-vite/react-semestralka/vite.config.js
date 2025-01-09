import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      //'/api': 'http://localhost:8080', - pre riot api (dorobit)
      '/api': 'http://localhost:5000',
    },
  },
  plugins: [react()]
})
