export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shipments: {
        Row: {
          id: string;
          tracking_number: string;
          origin: string;
          destination: string;
          status: 'pending' | 'in_transit' | 'delivered' | 'failed';
          created_by: string | null;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_number: string;
          origin: string;
          destination: string;
          status?: 'pending' | 'in_transit' | 'delivered' | 'failed';
          created_by?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_number?: string;
          origin?: string;
          destination?: string;
          status?: 'pending' | 'in_transit' | 'delivered' | 'failed';
          created_by?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'admin' | 'user';
          avatar_url: string | null;
          company: string | null;
          organization_id: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          company?: string | null;
          organization_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          company?: string | null;
          organization_id?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          plan: 'starter' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'past_due' | 'canceled' | 'expired';
          subscription_expires_at: string | null;
          max_users: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          owner_id: string;
          plan?: 'starter' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'expired';
          subscription_expires_at?: string | null;
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          plan?: 'starter' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'expired';
          subscription_expires_at?: string | null;
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          organization_id: string;
          token: string;
          created_by: string;
          max_uses: number;
          uses: number;
          expires_at: string;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          token?: string;
          created_by: string;
          max_uses?: number;
          uses?: number;
          expires_at?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          organization_id?: string;
          token?: string;
          created_by?: string;
          max_uses?: number;
          uses?: number;
          expires_at?: string;
          created_at?: string;
          is_active?: boolean;
        };
      };
    };
    Views: never;
    Functions: never;
    Enums: never;
  };
}
