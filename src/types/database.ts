export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'individual' | 'nri' | 'corporate' | 'field_force' | 'admin'
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'individual' | 'nri' | 'corporate' | 'field_force' | 'admin'
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'individual' | 'nri' | 'corporate' | 'field_force' | 'admin'
          created_at?: string | null
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string | null
          assigned_to: string | null
          property_id: string | null
          title: string
          description: string | null
          category: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status:
            | 'open'
            | 'scheduled'
            | 'in_progress'
            | 'closed'
            | 'cancelled'
          address: string | null
          scheduled_at: string | null
          closed_at: string | null
          has_photos: boolean | null
          sla_breached: boolean | null
          ticket_type: 'rm' | 'amc' | null
          payment_status: string | null
          payment_txn_id: string | null
          payment_amount: number | null
          payment_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          assigned_to?: string | null
          property_id?: string | null
          title: string
          description?: string | null
          category: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?:
            | 'open'
            | 'scheduled'
            | 'in_progress'
            | 'closed'
            | 'cancelled'
          address?: string | null
          scheduled_at?: string | null
          closed_at?: string | null
          has_photos?: boolean | null
          sla_breached?: boolean | null
          ticket_type?: 'rm' | 'amc' | null
          payment_status?: string | null
          payment_txn_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          assigned_to?: string | null
          property_id?: string | null
          title?: string
          description?: string | null
          category?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?:
            | 'open'
            | 'scheduled'
            | 'in_progress'
            | 'closed'
            | 'cancelled'
          address?: string | null
          scheduled_at?: string | null
          closed_at?: string | null
          has_photos?: boolean | null
          sla_breached?: boolean | null
          ticket_type?: 'rm' | 'amc' | null
          payment_status?: string | null
          payment_txn_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          address: string | null
          city: string | null
          society_name: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          address?: string | null
          city?: string | null
          society_name?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          address?: string | null
          city?: string | null
          society_name?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      pet_assets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: string | null
          breed: string | null
          age_months: number | null
          weight_kg: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species?: string | null
          breed?: string | null
          age_months?: number | null
          weight_kg?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          species?: string | null
          breed?: string | null
          age_months?: number | null
          weight_kg?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pet_visits: {
        Row: {
          id: string
          pet_asset_id: string
          user_id: string | null
          service_type: string
          visit_date: string | null
          status: string | null
          notes: string | null
          cost: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pet_asset_id: string
          user_id?: string | null
          service_type: string
          visit_date?: string | null
          status?: string | null
          notes?: string | null
          cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pet_asset_id?: string
          user_id?: string | null
          service_type?: string
          visit_date?: string | null
          status?: string | null
          notes?: string | null
          cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pet_services: {
        Row: {
          id: string
          pet_asset_id: string
          service_name: string
          status: string | null
          scheduled_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pet_asset_id: string
          service_name: string
          status?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pet_asset_id?: string
          service_name?: string
          status?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      field_agents: {
        Row: {
          id: string
          profile_id: string
          city: string | null
          service_area: string | null
          is_active: boolean | null
          rating: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          city?: string | null
          service_area?: string | null
          is_active?: boolean | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          city?: string | null
          service_area?: string | null
          is_active?: boolean | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      amc_contracts: {
        Row: {
          id: string
          client_id: string | null
          title: string
          description: string | null
          start_date: string
          end_date: string
          value_inr: number | null
          status: 'active' | 'expired' | 'pending' | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          title: string
          description?: string | null
          start_date: string
          end_date: string
          value_inr?: number | null
          status?: 'active' | 'expired' | 'pending' | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          value_inr?: number | null
          status?: 'active' | 'expired' | 'pending' | null
          created_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          ticket_id: string | null
          user_id: string | null
          amount: number
          currency: string | null
          status: string | null
          due_date: string | null
          paid_at: string | null
          external_invoice_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          user_id?: string | null
          amount: number
          currency?: string | null
          status?: string | null
          due_date?: string | null
          paid_at?: string | null
          external_invoice_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string | null
          user_id?: string | null
          amount?: number
          currency?: string | null
          status?: string | null
          due_date?: string | null
          paid_at?: string | null
          external_invoice_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      companion_care_visits: {
        Row: {
          id: string
          ticket_id: string | null
          caregiver_id: string | null
          check_in_at: string | null
          check_out_at: string | null
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          caregiver_id?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string | null
          caregiver_id?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      qc_reviews: {
        Row: {
          id: string
          ticket_id: string
          reviewer_id: string | null
          score: number | null
          status: string | null
          comments: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          reviewer_id?: string | null
          score?: number | null
          status?: string | null
          comments?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          reviewer_id?: string | null
          score?: number | null
          status?: string | null
          comments?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          ticket_id: string | null
          message: string
          type: string | null
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          ticket_id?: string | null
          message: string
          type?: string | null
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          ticket_id?: string | null
          message?: string
          type?: string | null
          read?: boolean | null
          created_at?: string | null
        }
      }
      booking_notifications: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          notification_type: 'email' | 'sms'
          event_type: string
          recipient: string
          subject: string | null
          template_name: string | null
          status: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message: string | null
          sent_at: string | null
          delivered_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          notification_type: 'email' | 'sms'
          event_type: string
          recipient: string
          subject?: string | null
          template_name?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          notification_type?: 'email' | 'sms'
          event_type?: string
          recipient?: string
          subject?: string | null
          template_name?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = TableRow<'profiles'>
export type Ticket = TableRow<'tickets'>
export type Property = TableRow<'properties'>
export type PetAsset = TableRow<'pet_assets'>
export type PetVisit = TableRow<'pet_visits'>
export type FieldAgent = TableRow<'field_agents'>
export type AMCContract = TableRow<'amc_contracts'>
export type Invoice = TableRow<'invoices'>
export type CompanionCareVisit = TableRow<'companion_care_visits'>
export type QCReview = TableRow<'qc_reviews'>
