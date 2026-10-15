import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  // The login app redirects SPOC users to http://localhost:5175/
  server: { port: 5175, strictPort: true },
})
