// @ts-ignore: Vite types may not be resolved in the current environment
import { defineConfig } from 'vite'
// @ts-ignore: Cannot find module '@vitejs/plugin-react' or its corresponding type declarations.
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // необходимо для работы в Docker
    port: 5173,
    watch: {
      usePolling: true, // гарантирует обновление страниц (HMR) внутри Docker на Windows/Mac
    },
  },
})
