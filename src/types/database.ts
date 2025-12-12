// ============================================
// PREREQ - Database Types (Supabase)
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          company: string | null;
          role: string | null;
          linkedin_url: string | null;
          linkedin_data: Json | null;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          company?: string | null;
          role?: string | null;
          linkedin_url?: string | null;
          linkedin_data?: Json | null;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          company?: string | null;
          role?: string | null;
          linkedin_url?: string | null;
          linkedin_data?: Json | null;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      briefs: {
        Row: {
          id: string;
          user_id: string;
          linkedin_url: string;
          meeting_goal: string;
          profile_name: string;
          profile_headline: string | null;
          profile_photo_url: string | null;
          profile_location: string | null;
          profile_company: string | null;
          profile_data: Json | null;
          summary: string;
          talking_points: Json;
          common_ground: Json;
          icebreaker: string;
          questions: Json;
          is_saved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          linkedin_url: string;
          meeting_goal?: string;
          profile_name: string;
          profile_headline?: string | null;
          profile_photo_url?: string | null;
          profile_location?: string | null;
          profile_company?: string | null;
          profile_data?: Json | null;
          summary: string;
          talking_points: Json;
          common_ground: Json;
          icebreaker: string;
          questions: Json;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          linkedin_url?: string;
          meeting_goal?: string;
          profile_name?: string;
          profile_headline?: string | null;
          profile_photo_url?: string | null;
          profile_location?: string | null;
          profile_company?: string | null;
          profile_data?: Json | null;
          summary?: string;
          talking_points?: Json;
          common_ground?: Json;
          icebreaker?: string;
          questions?: Json;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          brief_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brief_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brief_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
