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
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          company?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          company?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: never;
    Functions: never;
    Enums: never;
  };
}
