import { supabase } from './supabase'

// Ping Supabase every 4 days to prevent free tier pausing
export function startKeepAlive() {
  const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000

  async function ping() {
    try {
      await supabase.from('profiles').select('id').limit(1)
      console.log('Keep-alive ping sent:', new Date().toISOString())
    } catch (e) {
      console.log('Keep-alive ping failed:', e.message)
    }
  }

  ping() // ping immediately on load
  setInterval(ping, FOUR_DAYS)
}
