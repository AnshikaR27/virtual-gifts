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
          email: string | null;
          name: string | null;
          phone: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          phone?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          phone?: string | null;
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gifts: {
        Row: {
          id: string;
          short_id: string;
          creator_id: string;
          slug: string;
          sender_name: string | null;
          recipient_name: string;
          content_jsonb: Json;
          status: Database['public']['Enums']['gift_status'];
          paid: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_id: string;
          creator_id: string;
          slug: string;
          sender_name?: string | null;
          recipient_name: string;
          content_jsonb?: Json;
          status?: Database['public']['Enums']['gift_status'];
          paid?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          short_id?: string;
          slug?: string;
          sender_name?: string | null;
          recipient_name?: string;
          content_jsonb?: Json;
          status?: Database['public']['Enums']['gift_status'];
          paid?: boolean;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      gift_views: {
        Row: {
          id: string;
          gift_id: string;
          viewed_at: string;
          device_info: Json | null;
          view_duration_ms: number | null;
        };
        Insert: {
          id?: string;
          gift_id: string;
          viewed_at?: string;
          device_info?: Json | null;
          view_duration_ms?: number | null;
        };
        Update: {
          gift_id?: string;
          viewed_at?: string;
          device_info?: Json | null;
          view_duration_ms?: number | null;
        };
        Relationships: [];
      };
      interactions: {
        Row: {
          id: string;
          gift_id: string;
          type: string;
          value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gift_id: string;
          type: string;
          value?: Json | null;
          created_at?: string;
        };
        Update: {
          gift_id?: string;
          type?: string;
          value?: Json | null;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          gift_id: string;
          image_url: string | null;
          video_url: string | null;
          recipient_consent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          gift_id: string;
          image_url?: string | null;
          video_url?: string | null;
          recipient_consent?: boolean;
          created_at?: string;
        };
        Update: {
          gift_id?: string;
          image_url?: string | null;
          video_url?: string | null;
          recipient_consent?: boolean;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: Database['public']['Enums']['subscription_status'];
          razorpay_sub_id: string | null;
          started_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          status?: Database['public']['Enums']['subscription_status'];
          razorpay_sub_id?: string | null;
          started_at?: string;
          expires_at: string;
        };
        Update: {
          plan?: string;
          status?: Database['public']['Enums']['subscription_status'];
          razorpay_sub_id?: string | null;
          expires_at?: string;
        };
        Relationships: [];
      };
      prompt_inspirations: {
        Row: {
          id: string;
          gift_slug: string;
          prompt_id: string;
          anonymous_response: string;
          public_consent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          gift_slug: string;
          prompt_id: string;
          anonymous_response: string;
          public_consent?: boolean;
          created_at?: string;
        };
        Update: {
          gift_slug?: string;
          prompt_id?: string;
          anonymous_response?: string;
          public_consent?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gift_status: 'draft' | 'paid' | 'sent' | 'archived';
      subscription_status: 'active' | 'past_due' | 'cancelled' | 'expired';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
