import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use VITE_BASE_PATH if defined, otherwise default to GitHub Pages path
  // Set VITE_BASE_PATH="/" in Render environment variables!
  base: process.env.VITE_BASE_PATH || "/resume-generator/", 
})
