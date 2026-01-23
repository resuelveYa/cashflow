// src/config/env.ts
// Centralized environment configuration

export const ENV = {
  // Supabase Configuration
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },

  // App Configuration
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'SAER',
    DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Sistema de Administración para Empresas de Construcción',
  },

  // URLs for redirects
  URLS: {
    LANDING: import.meta.env.VITE_LANDING_URL || 'https://resuelveya.cl',
    APP: import.meta.env.VITE_APP_URL || window.location.origin,
  }
};
