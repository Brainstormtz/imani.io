export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CommunicationType = 'leave_request' | 'complaint' | 'query' | 'notice' | 'payment_advance';
export type CommunicationStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type CommunicationChannel = 'email' | 'whatsapp';
export type UserRole = 'hr_admin' | 'manager' | 'employee';

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          company_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_id?: string
          created_at?: string
          updated_at?: string
        }
      },
      companies: {
        Row: {
          id: string
          name: string
          code: string
          email_domain: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          company_id: string
          role: string
          full_name: string | null
          phone_number: string | null
          email: string | null
          communication_channels: string[]
          profile_image_url: string | null
          id_card_url: string | null
          facial_recognition_data: Json | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_id: string
          role: string
          full_name?: string | null
          phone_number?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          role?: string
          full_name?: string | null
          phone_number?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_pins: {
        Row: {
          id: string
          profile_id: string
          pin_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          pin_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          pin_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      communications: {
        Row: {
          id: string
          employee_id: string
          channel: CommunicationChannel
          type: CommunicationType
          content: string
          status: CommunicationStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          channel: CommunicationChannel
          type: CommunicationType
          content: string
          status?: CommunicationStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          channel?: CommunicationChannel
          type?: CommunicationType
          content?: string
          status?: CommunicationStatus
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_company_and_admin: {
        Args: {
          company_name: string
          company_code: string
          full_name: string
          email: string
          phone_number: string
          password: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
