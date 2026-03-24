import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd6fa-2001-448a-4081-1c8b-b0a4-95b5-3f2c-732b.ngrok-free.app',
      '.ngrok-free.app'
    ],
  },
})
