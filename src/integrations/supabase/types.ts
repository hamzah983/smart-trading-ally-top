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
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string
          closed_at: string | null
          created_at: string
          entry_price: number
          id: string
          lot_size: number
          pnl: number | null
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          type: string
        }
        Insert: {
          account_id: string
          closed_at?: string | null
          created_at?: string
          entry_price: number
          id?: string
          lot_size: number
          pnl?: number | null
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          type: string
        }
        Update: {
          account_id?: string
          closed_at?: string | null
          created_at?: string
          entry_price?: number
          id?: string
          lot_size?: number
          pnl?: number | null
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_name: string
          api_key: string | null
          api_secret: string | null
          balance: number | null
          broker_name: string | null
          broker_url: string | null
          connection_status: boolean | null
          created_at: string
          daily_profit_target: number | null
          equity: number | null
          id: string
          is_active: boolean | null
          is_api_verified: boolean | null
          last_sync_time: string | null
          leverage: number | null
          max_drawdown: number | null
          platform: string
          risk_level: string | null
          trading_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          api_key?: string | null
          api_secret?: string | null
          balance?: number | null
          broker_name?: string | null
          broker_url?: string | null
          connection_status?: boolean | null
          created_at?: string
          daily_profit_target?: number | null
          equity?: number | null
          id?: string
          is_active?: boolean | null
          is_api_verified?: boolean | null
          last_sync_time?: string | null
          leverage?: number | null
          max_drawdown?: number | null
          platform: string
          risk_level?: string | null
          trading_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          api_key?: string | null
          api_secret?: string | null
          balance?: number | null
          broker_name?: string | null
          broker_url?: string | null
          connection_status?: boolean | null
          created_at?: string
          daily_profit_target?: number | null
          equity?: number | null
          id?: string
          is_active?: boolean | null
          is_api_verified?: boolean | null
          last_sync_time?: string | null
          leverage?: number | null
          max_drawdown?: number | null
          platform?: string
          risk_level?: string | null
          trading_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_bots: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          performance_metrics: Json | null
          risk_parameters: Json | null
          settings: Json | null
          strategy_type: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          performance_metrics?: Json | null
          risk_parameters?: Json | null
          settings?: Json | null
          strategy_type: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          performance_metrics?: Json | null
          risk_parameters?: Json | null
          settings?: Json | null
          strategy_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_bots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_logs: {
        Row: {
          account_id: string | null
          bot_id: string | null
          created_at: string
          details: Json | null
          id: string
          log_type: string
          message: string
        }
        Insert: {
          account_id?: string | null
          bot_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          log_type: string
          message: string
        }
        Update: {
          account_id?: string | null
          bot_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "trading_bots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
