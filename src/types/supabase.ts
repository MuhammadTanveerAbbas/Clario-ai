export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing' | 'unpaid'
          billing_cycle: 'monthly' | 'annual'
          requests_used: number
          requests_reset_at: string
          onboarding_completed: boolean
          onboarding_steps: Json
          theme: 'dark' | 'light'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing' | 'unpaid'
          billing_cycle?: 'monthly' | 'annual'
          requests_used?: number
          requests_reset_at?: string
          onboarding_completed?: boolean
          onboarding_steps?: Json
          theme?: 'dark' | 'light'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing' | 'unpaid'
          billing_cycle?: 'monthly' | 'annual'
          requests_used?: number
          requests_reset_at?: string
          onboarding_completed?: boolean
          onboarding_steps?: Json
          theme?: 'dark' | 'light'
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          type: 'summarize' | 'chat' | 'remix' | 'brand_voice' | 'image_prompt' | 'calendar_event' | 'export_notion' | 'export_gdocs'
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'summarize' | 'chat' | 'remix' | 'brand_voice' | 'image_prompt' | 'calendar_event' | 'export_notion' | 'export_gdocs'
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'summarize' | 'chat' | 'remix' | 'brand_voice' | 'image_prompt' | 'calendar_event' | 'export_notion' | 'export_gdocs'
          metadata?: Json
          created_at?: string
        }
      }
      api_rate_limits: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          window_start: string
          request_count: number
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          window_start?: string
          request_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          window_start?: string
          request_count?: number
        }
      }
      brand_voices: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          examples: string | null
          samples: string[]
          tone: string | null
          vocabulary: string | null
          personality: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          examples?: string | null
          samples?: string[]
          tone?: string | null
          vocabulary?: string | null
          personality?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          examples?: string | null
          samples?: string[]
          tone?: string | null
          vocabulary?: string | null
          personality?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      summarizer_history: {
        Row: {
          id: string
          user_id: string
          source_type: 'youtube_url' | 'paste_text'
          source_url: string | null
          source_title: string | null
          input_text: string
          summary_mode: string
          output_text: string
          brand_voice_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: 'youtube_url' | 'paste_text'
          source_url?: string | null
          source_title?: string | null
          input_text: string
          summary_mode: string
          output_text: string
          brand_voice_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: 'youtube_url' | 'paste_text'
          source_url?: string | null
          source_title?: string | null
          input_text?: string
          summary_mode?: string
          output_text?: string
          brand_voice_id?: string | null
          created_at?: string
        }
      }
      remix_history: {
        Row: {
          id: string
          user_id: string
          input_text: string
          outputs: Json
          brand_voice_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_text: string
          outputs?: Json
          brand_voice_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input_text?: string
          outputs?: Json
          brand_voice_id?: string | null
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          platform: string | null
          content_text: string | null
          scheduled_at: string
          status: 'draft' | 'scheduled' | 'published' | 'cancelled'
          remix_history_id: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          platform?: string | null
          content_text?: string | null
          scheduled_at: string
          status?: 'draft' | 'scheduled' | 'published' | 'cancelled'
          remix_history_id?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          platform?: string | null
          content_text?: string | null
          scheduled_at?: string
          status?: 'draft' | 'scheduled' | 'published' | 'cancelled'
          remix_history_id?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      image_prompts: {
        Row: {
          id: string
          user_id: string
          source_text: string
          style: string | null
          platform: string | null
          prompt_text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_text: string
          style?: string | null
          platform?: string | null
          prompt_text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_text?: string
          style?: string | null
          platform?: string | null
          prompt_text?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      processed_webhook_events: {
        Row: {
          id: string
          processed_at: string
        }
        Insert: {
          id: string
          processed_at?: string
        }
        Update: {
          id?: string
          processed_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          type: 'bug' | 'feature' | 'general' | 'billing'
          message: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type?: 'bug' | 'feature' | 'general' | 'billing'
          message: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'bug' | 'feature' | 'general' | 'billing'
          message?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          user_id: string
          plan: string | null
          requests_used: number | null
          requests_limit: number | null
          usage_pct: number | null
          summaries_this_month: number | null
          remixes_this_month: number | null
          chats_this_month: number | null
          brand_voices_count: number | null
          scheduled_posts: number | null
          requests_reset_at: string | null
        }
      }
    }
    Functions: {
      increment_usage: {
        Args: {
          p_user_id: string
          p_type: string
          p_metadata?: Json
        }
        Returns: {
          allowed: boolean
          requests_used: number
          requests_limit: number
        }
      }
      reset_monthly_usage: {
        Args: Record<string, never>
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_endpoint: string
        }
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
