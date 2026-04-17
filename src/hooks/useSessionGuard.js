import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useSessionGuard() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        toast('Session expired. Please sign in again.', { icon: '🔒' })
        navigate('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])
}
