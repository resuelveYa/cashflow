import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: '/cashflow', // 👈 ahora configurado para sub-ruta en producción
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
    allowedHosts: ['app.resuelveya.cl', 'cashflow.resuelveya.cl', 'resuelveya.cl', 'localhost']
  }
});
