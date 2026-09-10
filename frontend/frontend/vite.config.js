import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host:true,
    allowedHosts:[
      "here-vehicles-manitoba-foto.trycloudflare.com"
    ]
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth']
  }
})
