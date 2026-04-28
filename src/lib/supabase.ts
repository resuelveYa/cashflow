// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isProduction = typeof window !== 'undefined'
  ? window.location.hostname.endsWith('licitex.cl')
  : import.meta.env.PROD

const isDevMode = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : !import.meta.env.PROD

const cookieConfig = isProduction
  ? { domain: '.licitex.cl', path: '/', sameSite: 'lax' as const, secure: true }
  : { path: '/', sameSite: 'lax' as const, secure: false }

const getLocalToken = () => {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find(row => row.startsWith('sb-local-token='))?.split('=')[1] ?? null
}

const setLocalToken = (token: string | null) => {
  if (typeof document === 'undefined') return
  document.cookie = token
    ? `sb-local-token=${token}; path=/; max-age=604800; SameSite=Lax`
    : `sb-local-token=; path=/; max-age=0; SameSite=Lax`
}

const mockUser = {
  id: 'local-admin-id',
  email: 'admin@saer.cl',
  user_metadata: { full_name: 'Administrador Local' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

const mockSession = {
  access_token: 'local-admin-bypass-token',
  refresh_token: 'local-admin-bypass-refresh-token',
  user: mockUser,
}

const mockClient = {
  auth: {
    getUser: () => {
      const token = getLocalToken()
      return Promise.resolve(token === 'local-admin-bypass-token'
        ? { data: { user: mockUser }, error: null }
        : { data: { user: null }, error: null })
    },
    getSession: () => {
      const token = getLocalToken()
      return Promise.resolve(token === 'local-admin-bypass-token'
        ? { data: { session: mockSession }, error: null }
        : { data: { session: null }, error: null })
    },
    signInWithPassword: ({ email }: { email: string }) => {
      if (email === 'admin@saer.cl') {
        setLocalToken('local-admin-bypass-token')
        return Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null })
      }
      return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Modo desarrollo: usa admin@saer.cl' } })
    },
    signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
    setSession: (session: any) => {
      if (session?.access_token === 'local-admin-bypass-token') {
        setLocalToken('local-admin-bypass-token')
      }
      return Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null })
    },
    onAuthStateChange: (callback: any) => {
      const token = getLocalToken()
      if (token === 'local-admin-bypass-token') {
        setTimeout(() => callback('SIGNED_IN', mockSession), 0)
      }
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signOut: () => {
      setLocalToken(null)
      return Promise.resolve({ error: null })
    },
  },
  storage: { from: () => ({ upload: () => Promise.resolve({ data: {}, error: null }) }) },
} as any

let supabaseInstance: any = null;

export const supabase = (() => {
  if (isDevMode) return mockClient

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: cookieConfig
    })
  }
  return supabaseInstance;
})();

