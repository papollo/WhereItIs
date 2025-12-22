export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json
                    operationName?: string
                    query?: string
                    variables?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            event_logs: {
                Row: {
                    event_time: string
                    furniture_id: string | null
                    id: number
                    item_id: string | null
                    message: string
                    room_id: string | null
                    user_id: string
                }
                Insert: {
                    event_time?: string
                    furniture_id?: string | null
                    id?: number
                    item_id?: string | null
                    message: string
                    room_id?: string | null
                    user_id: string
                }
                Update: {
                    event_time?: string
                    furniture_id?: string | null
                    id?: number
                    item_id?: string | null
                    message?: string
                    room_id?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "event_logs_furniture_id_fkey"
                        columns: ["furniture_id"]
                        isOneToOne: false
                        referencedRelation: "furniture"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_logs_item_id_fkey"
                        columns: ["item_id"]
                        isOneToOne: false
                        referencedRelation: "items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_logs_room_id_fkey"
                        columns: ["room_id"]
                        isOneToOne: false
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                ]
            }
            furniture: {
                Row: {
                    color: string
                    created_at: string
                    created_by: string
                    description: string | null
                    id: string
                    name: string
                    room_id: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    color?: string
                    created_at?: string
                    created_by: string
                    description?: string | null
                    id?: string
                    name: string
                    room_id: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    color?: string
                    created_at?: string
                    created_by?: string
                    description?: string | null
                    id?: string
                    name?: string
                    room_id?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "furniture_room_id_fkey"
                        columns: ["room_id"]
                        isOneToOne: false
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                ]
            }
            items: {
                Row: {
                    created_at: string
                    created_by: string
                    furniture_id: string
                    id: string
                    name: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    created_by: string
                    furniture_id: string
                    id?: string
                    name: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    created_by?: string
                    furniture_id?: string
                    id?: string
                    name?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "items_furniture_id_fkey"
                        columns: ["furniture_id"]
                        isOneToOne: false
                        referencedRelation: "furniture"
                        referencedColumns: ["id"]
                    },
                ]
            }
            onboarding: {
                Row: {
                    completed_at: string | null
                    last_step: string | null
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    last_step?: string | null
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    last_step?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            rooms: {
                Row: {
                    color: string
                    created_at: string
                    created_by: string
                    id: string
                    name: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    color?: string
                    created_at?: string
                    created_by: string
                    id?: string
                    name: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    color?: string
                    created_at?: string
                    created_by?: string
                    id?: string
                    name?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            purge_event_logs_older_than_30_days: { Args: never; Returns: undefined }
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
    DefaultSchemaTableNameOrOptions extends | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaEnumNameOrOptions extends | keyof DefaultSchema["Enums"]
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
    PublicCompositeTypeNameOrOptions extends | keyof DefaultSchema["CompositeTypes"]
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
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const
