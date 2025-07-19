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
      board_days: {
        Row: {
          board_id: number
          color_index: number
          created_at: string
          created_day: number
          done: boolean
          id: number
          notes: string
        }
        Insert: {
          board_id: number
          color_index?: number
          created_at?: string
          created_day: number
          done: boolean
          id?: number
          notes?: string
        }
        Update: {
          board_id?: number
          color_index?: number
          created_at?: string
          created_day?: number
          done?: boolean
          id?: number
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_days_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          board_title: string
          created_at: string
          id: number
          section: string
          user_id: string
        }
        Insert: {
          board_title: string
          created_at?: string
          id?: number
          section?: string
          user_id: string
        }
        Update: {
          board_title?: string
          created_at?: string
          id?: number
          section?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      day_notes: {
        Row: {
          created_at: string
          created_day: number
          id: number
          notes: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_day: number
          id?: number
          notes?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_day?: number
          id?: number
          notes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_quizzes: {
        Row: {
          created_at: string | null
          id: number
          outcome: string
          quiz_data: Json
          scenario: string
          starred: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          outcome: string
          quiz_data: Json
          scenario: string
          starred?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          outcome?: string
          quiz_data?: Json
          scenario?: string
          starred?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      solstra_dragon_state: {
        Row: {
          created_at: string | null
          hunger_time_marker: string | null
          id: number
          last_status_change: string | null
          status_line_index: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          hunger_time_marker?: string | null
          id?: number
          last_status_change?: string | null
          status_line_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          hunger_time_marker?: string | null
          id?: number
          last_status_change?: string | null
          status_line_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solstra_feeding_log: {
        Row: {
          created_at: string | null
          first_tasted_at: string | null
          food_name: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_tasted_at?: string | null
          food_name: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_tasted_at?: string | null
          food_name?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      solstra_milestone_notifs: {
        Row: {
          id: number
          milestone_type: string
          notified_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          milestone_type: string
          notified_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          milestone_type?: string
          notified_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solstra_user_inventory: {
        Row: {
          created_at: string | null
          id: number
          item_name: string
          received_at: string | null
          received_from: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_name: string
          received_at?: string | null
          received_from: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          item_name?: string
          received_at?: string | null
          received_from?: string
          user_id?: string | null
        }
        Relationships: []
      }
      solstra_villager_harvests: {
        Row: {
          created_at: string | null
          daily_freebie_used: boolean | null
          harvest_date: string | null
          has_harvested: boolean | null
          id: number
          user_id: string | null
          villager_name: string
        }
        Insert: {
          created_at?: string | null
          daily_freebie_used?: boolean | null
          harvest_date?: string | null
          has_harvested?: boolean | null
          id?: number
          user_id?: string | null
          villager_name: string
        }
        Update: {
          created_at?: string | null
          daily_freebie_used?: boolean | null
          harvest_date?: string | null
          has_harvested?: boolean | null
          id?: number
          user_id?: string | null
          villager_name?: string
        }
        Relationships: []
      }
      user_info: {
        Row: {
          boards_ordering: Json | null
          display_name: string | null
          id: string
          start_weekday: number
        }
        Insert: {
          boards_ordering?: Json | null
          display_name?: string | null
          id: string
          start_weekday?: number
        }
        Update: {
          boards_ordering?: Json | null
          display_name?: string | null
          id?: string
          start_weekday?: number
        }
        Relationships: []
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
    Enums: {},
  },
} as const
