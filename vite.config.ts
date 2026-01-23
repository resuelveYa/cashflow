import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: '/', // 👈 Ahora en su propio subdominio, no necesita sub-ruta
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: true, // 👈 asegura que el host sea accesible desde la red
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    allowedHosts: ['.ngrok-free.app'], // útil pero no esencial con host: true
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: true
  }
});
