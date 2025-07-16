export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      daily_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      market_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_health: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_check_at: string
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check_at?: string
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_check_at?: string
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination_address: string
          email: string
          expires_at: string
          id: string
          ledger_index: number | null
          status: string
          transaction_hash: string | null
          updated_at: string
          xaman_request_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          destination_address: string
          email: string
          expires_at?: string
          id?: string
          ledger_index?: number | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          xaman_request_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination_address?: string
          email?: string
          expires_at?: string
          id?: string
          ledger_index?: number | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          xaman_request_id?: string | null
        }
        Relationships: []
      }
      pending_memberships: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          email: string
          granted_at: string
          id: string
          is_purchased: boolean
          payment_id: string
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email: string
          granted_at?: string
          id?: string
          is_purchased?: boolean
          payment_id: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          email?: string
          granted_at?: string
          id?: string
          is_purchased?: boolean
          payment_id?: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed_at: string
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      user_daily_tips: {
        Row: {
          created_at: string
          id: string
          shown_date: string
          tip_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shown_date?: string
          tip_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shown_date?: string
          tip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_tips_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "daily_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_purchased: boolean
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_purchased?: boolean
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_purchased?: boolean
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_monitoring: {
        Row: {
          alert_threshold: number
          created_at: string
          id: string
          is_active: boolean
          last_checked_at: string | null
          last_ledger_index: number | null
          owner_name: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          alert_threshold?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          last_ledger_index?: number | null
          owner_name: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          alert_threshold?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          last_ledger_index?: number | null
          owner_name?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination_address: string | null
          id: string
          ledger_index: number
          processed_at: string
          source_address: string | null
          transaction_date: string
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          destination_address?: string | null
          id?: string
          ledger_index: number
          processed_at?: string
          source_address?: string | null
          transaction_date: string
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination_address?: string | null
          id?: string
          ledger_index?: number
          processed_at?: string
          source_address?: string | null
          transaction_date?: string
          transaction_hash?: string
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      whale_alerts: {
        Row: {
          alert_type: string
          amount: number
          created_at: string
          id: string
          is_sent: boolean
          owner_name: string
          sent_at: string | null
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          alert_type?: string
          amount: number
          created_at?: string
          id?: string
          is_sent?: boolean
          owner_name: string
          sent_at?: string | null
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Update: {
          alert_type?: string
          amount?: number
          created_at?: string
          id?: string
          is_sent?: boolean
          owner_name?: string
          sent_at?: string | null
          transaction_hash?: string
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "whale_alerts_transaction_hash_fkey"
            columns: ["transaction_hash"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["transaction_hash"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_wallet_transaction_exists: {
        Args: {
          p_wallet_address: string
          p_transaction_hash: string
          p_amount: number
          p_transaction_type: string
        }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_membership_tier: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      make_first_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_net_http_post: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      test_whale_alert_trigger: {
        Args: {
          p_wallet_address: string
          p_owner_name: string
          p_transaction_hash: string
          p_amount: number
          p_transaction_type?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
      membership_tier: "free" | "advanced" | "pro"
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
      app_role: ["super_admin", "admin", "moderator", "user"],
      membership_tier: ["free", "advanced", "pro"],
    },
  },
} as const
