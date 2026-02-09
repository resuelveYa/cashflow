// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Detect if we are on a resuelveya.cl domain (including subdomains)
const isProduction = typeof window !== 'undefined'
  ? window.location.hostname.endsWith('resuelveya.cl')
  : import.meta.env.PROD

// Cookie config varies between dev and production
const cookieConfig = isProduction
  ? { domain: '.resuelveya.cl', path: '/', sameSite: 'lax' as const, secure: true }
  : { path: '/', sameSite: 'lax' as const, secure: false }

let supabaseInstance: any = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: cookieConfig
    })
  }
  return supabaseInstance;
})();

