import { createClient, type RealtimeChannel, type RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database, TableInsert, TableRow } from '../types/database'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_*).'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error('No authenticated user found.')
  return userId
}

export async function getMyTickets() {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMyProperties() {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMyPets() {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from('pet_assets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTicket(input: TableInsert<'tickets'>) {
  const userId = await getCurrentUserId()
  const payload: TableInsert<'tickets'> = { ...input, user_id: input.user_id ?? userId }
  const { data, error } = await supabase.from('tickets').insert(payload).select('*').single()
  if (error) throw error
  return data
}

export async function getPetServices(petAssetId: string) {
  const { data, error } = await supabase
    .from('pet_services')
    .select('*')
    .eq('pet_asset_id', petAssetId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

type TicketRow = TableRow<'tickets'>
type NotificationRow = TableRow<'notifications'>

export function subscribeToTicketUpdates(
  ticketId: string,
  onChange: (payload: RealtimePostgresChangesPayload<TicketRow>) => void
): RealtimeChannel {
  return supabase
    .channel(`tickets:${ticketId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
      onChange
    )
    .subscribe()
}

export function subscribeToMyNotifications(
  userId: string,
  onChange: (payload: RealtimePostgresChangesPayload<NotificationRow>) => void
): RealtimeChannel {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      onChange
    )
    .subscribe()
}
