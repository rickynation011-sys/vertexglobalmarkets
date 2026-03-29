export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deposit_methods: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          label: string | null
          network: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          is_active?: boolean
          label?: string | null
          network?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          label?: string | null
          network?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          id: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          payment_method: string
          processing_fee: number
          proof_url: string | null
          reviewed_by: string | null
          status: string
          total_profit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          payment_method: string
          processing_fee: number
          proof_url?: string | null
          reviewed_by?: string | null
          status?: string
          total_profit: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          payment_method?: string
          processing_fee?: number
          proof_url?: string | null
          reviewed_by?: string | null
          status?: string
          total_profit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          current_value: number
          daily_rate: number
          ends_at: string
          id: string
          plan_name: string
          return_pct: number | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          current_value: number
          daily_rate?: number
          ends_at: string
          id?: string
          plan_name: string
          return_pct?: number | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_value?: number
          daily_rate?: number
          ends_at?: string
          id?: string
          plan_name?: string
          return_pct?: number | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          document_type: string
          document_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          selfie_url: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      landing_investors: {
        Row: {
          country: string
          created_at: string
          id: string
          is_active: boolean
          monthly_profit: string
          name: string
          photo_url: string | null
          portfolio_value: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_profit?: string
          name: string
          photo_url?: string | null
          portfolio_value?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_profit?: string
          name?: string
          photo_url?: string | null
          portfolio_value?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      landing_testimonials: {
        Row: {
          country: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          rating: number
          review: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          rating?: number
          review: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          rating?: number
          review?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      landing_traders: {
        Row: {
          country: string
          created_at: string
          flag: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          sort_order: number
          total_profit: string
          updated_at: string
          win_rate: number
        }
        Insert: {
          country: string
          created_at?: string
          flag?: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          sort_order?: number
          total_profit?: string
          updated_at?: string
          win_rate?: number
        }
        Update: {
          country?: string
          created_at?: string
          flag?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          sort_order?: number
          total_profit?: string
          updated_at?: string
          win_rate?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          deposit_withdrawal_email: boolean
          deposit_withdrawal_in_app: boolean
          deposit_withdrawal_push: boolean
          id: string
          market_news_email: boolean
          market_news_in_app: boolean
          market_news_push: boolean
          trade_executed_email: boolean
          trade_executed_in_app: boolean
          trade_executed_push: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit_withdrawal_email?: boolean
          deposit_withdrawal_in_app?: boolean
          deposit_withdrawal_push?: boolean
          id?: string
          market_news_email?: boolean
          market_news_in_app?: boolean
          market_news_push?: boolean
          trade_executed_email?: boolean
          trade_executed_in_app?: boolean
          trade_executed_push?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deposit_withdrawal_email?: boolean
          deposit_withdrawal_in_app?: boolean
          deposit_withdrawal_push?: boolean
          id?: string
          market_news_email?: boolean
          market_news_in_app?: boolean
          market_news_push?: boolean
          trade_executed_email?: boolean
          trade_executed_in_app?: boolean
          trade_executed_push?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel_email: boolean
          channel_in_app: boolean
          channel_push: boolean
          created_at: string
          id: string
          message: string
          sent_by: string | null
          status: string
          target: string
          target_user_id: string | null
          title: string
        }
        Insert: {
          channel_email?: boolean
          channel_in_app?: boolean
          channel_push?: boolean
          created_at?: string
          id?: string
          message: string
          sent_by?: string | null
          status?: string
          target?: string
          target_user_id?: string | null
          title: string
        }
        Update: {
          channel_email?: boolean
          channel_in_app?: boolean
          channel_push?: boolean
          created_at?: string
          id?: string
          message?: string
          sent_by?: string | null
          status?: string
          target?: string
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string
          email: string | null
          full_name: string | null
          id: string
          last_profit_processed_date: string | null
          phone: string | null
          referred_by: string | null
          status: string
          timezone: string | null
          updated_at: string
          user_id: string
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_profit_processed_date?: string | null
          phone?: string | null
          referred_by?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_profit_processed_date?: string | null
          phone?: string | null
          referred_by?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      profit_logs: {
        Row: {
          amount: number
          created_at: string
          id: string
          investment_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investment_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profit_logs_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_processing_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          processed_count: number
          status: string
          total_profit: number
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_count?: number
          status?: string
          total_profit?: number
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_count?: number
          status?: string
          total_profit?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          bonus_currency: string
          created_at: string
          id: string
          level: number
          referred_user_id: string
          referrer_id: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          bonus_amount?: number
          bonus_currency?: string
          created_at?: string
          id?: string
          level?: number
          referred_user_id: string
          referrer_id: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          bonus_amount?: number
          bonus_currency?: string
          created_at?: string
          id?: string
          level?: number
          referred_user_id?: string
          referrer_id?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      signal_subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          plan_name: string
          started_at: string
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at: string
          id?: string
          plan_name?: string
          started_at?: string
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          plan_name?: string
          started_at?: string
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_subscriptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          attachment_url: string | null
          category: string
          created_at: string
          id: string
          last_message_at: string | null
          message: string
          replied_at: string | null
          replied_by: string | null
          status: string
          subject: string
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          message: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject: string
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          message?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject?: string
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          asset: string
          closed_at: string | null
          created_at: string
          id: string
          pnl: number | null
          price: number | null
          side: string
          status: string
          stop_loss: number | null
          take_profit: number | null
          user_id: string
        }
        Insert: {
          amount: number
          asset: string
          closed_at?: string | null
          created_at?: string
          id?: string
          pnl?: number | null
          price?: number | null
          side: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          asset?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          pnl?: number | null
          price?: number | null
          side?: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          method: string
          reviewed_by: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method: string
          reviewed_by?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          reviewed_by?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_referral_code: { Args: { _code: string }; Returns: string }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
