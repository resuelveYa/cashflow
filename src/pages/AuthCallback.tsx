// src/pages/AuthCallback.tsx
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * /auth/callback
 *
 * Recibe el token-handoff desde landing (que corre en otro puerto en dev).
 * Landing pasa los tokens en el hash de la URL:
 *   /auth/callback?next=/&access_token=X&refresh_token=Y (en el hash)
 *
 * Llamamos supabase.auth.setSession() para establecer la sesión en este origen.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const handleCallback = async () => {
      const hash = window.location.hash
      const next = searchParams.get('next') || '/'

      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (error) {
              console.error('[AuthCallback] Error setting session:', error.message)
              const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000'
              window.location.href = `${landingUrl}/sign-in?redirect_url=${encodeURIComponent(window.location.origin + next)}`
              return
            }
            console.log('[AuthCallback] Session established successfully')
            navigate(next, { replace: true })
            return
          } catch (err) {
            console.error('[AuthCallback] Unexpected error:', err)
          }
        }
      }

      // No hay tokens → redirigir al login
      const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000'
      window.location.href = `${landingUrl}/sign-in?redirect_url=${encodeURIComponent(window.location.origin + next)}`
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid #2563eb', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
        }} />
        <p style={{ color: '#4b5563', fontWeight: 500 }}>Iniciando sesión...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
