// src/config/env.ts
// Centralized environment configuration

export const ENV = {
  // Clerk Configuration
  CLERK: {
    PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    SIGN_IN_URL: import.meta.env.VITE_CLERK_SIGN_IN_URL || 'http://localhost:3000/sign-in',
    SIGN_UP_URL: import.meta.env.VITE_CLERK_SIGN_UP_URL || 'http://localhost:3000/sign-up',
    AFTER_SIGN_IN_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || 'http://localhost:5173',
    AFTER_SIGN_UP_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || 'http://localhost:5173',
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
    LANDING: import.meta.env.VITE_CLERK_SIGN_IN_URL?.replace('/sign-in', '') || 'http://localhost:3000',
    APP: import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || 'http://localhost:5173',
  }
};
