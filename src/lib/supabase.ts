// Supabase client configuration
// Replace these with your actual Supabase project credentials

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that we have the required credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types (we'll define these as we create tables)
export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          organization_name: string;
          country: string;
          logo?: string;
          bio?: string;
          website?: string;
          poc_name: string;
          poc_email: string;
          poc_title?: string;
          member_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_name: string;
          country: string;
          logo?: string;
          bio?: string;
          website?: string;
          poc_name: string;
          poc_email: string;
          poc_title?: string;
          member_count: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_name?: string;
          country?: string;
          logo?: string;
          bio?: string;
          website?: string;
          poc_name?: string;
          poc_email?: string;
          poc_title?: string;
          member_count?: number;
          updated_at?: string;
        };
      };
      member_persons: {
        Row: {
          id: string;
          member_id: string;
          name: string;
          email: string;
          title?: string;
          is_voting_rep: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          name: string;
          email: string;
          title?: string;
          is_voting_rep: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          name?: string;
          email?: string;
          title?: string;
          is_voting_rep?: boolean;
        };
      };
      votes: {
        Row: {
          id: string;
          title: string;
          description: string;
          organization: string;
          end_time: string;
          status: 'active' | 'closed' | 'draft';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          organization: string;
          end_time: string;
          status?: 'active' | 'closed' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          organization?: string;
          end_time?: string;
          status?: 'active' | 'closed' | 'draft';
          updated_at?: string;
        };
      };
      vote_options: {
        Row: {
          id: string;
          vote_id: string;
          label: string;
          votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          vote_id: string;
          label: string;
          votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          vote_id?: string;
          label?: string;
          votes?: number;
        };
      };
      files: {
        Row: {
          id: string;
          name: string;
          type: string;
          description?: string;
          category_id?: string;
          file_url?: string;
          uploaded_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description?: string;
          category_id?: string;
          file_url?: string;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string;
          category_id?: string;
          file_url?: string;
          uploaded_by?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          name: string;
          description?: string;
          embed_url: string;
          uploaded_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          embed_url: string;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          embed_url?: string;
          uploaded_by?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id?: string;
          type: 'vote' | 'mention' | 'reply' | 'file' | 'member' | 'system';
          title: string;
          message: string;
          link?: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: 'vote' | 'mention' | 'reply' | 'file' | 'member' | 'system';
          title: string;
          message: string;
          link?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          read?: boolean;
        };
      };
    };
  };
}

