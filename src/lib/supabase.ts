// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance: any = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        domain: '.resuelveya.cl',
        path: '/',
        sameSite: 'lax',
        secure: true,
      }
    })
  }
  return supabaseInstance;
})();
