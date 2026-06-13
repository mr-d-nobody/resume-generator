import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use VITE_BASE_PATH if defined, otherwise default to root path for Vercel
  base: process.env.VITE_BASE_PATH || "/", 
})
