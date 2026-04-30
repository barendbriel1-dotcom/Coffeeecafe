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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asset_history: {
        Row: {
          action: string
          asset_id: string
          created_at: string
          from_user: string | null
          id: string
          notes: string | null
          performed_by: string | null
          to_user: string | null
        }
        Insert: {
          action: string
          asset_id: string
          created_at?: string
          from_user?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          to_user?: string | null
        }
        Update: {
          action?: string
          asset_id?: string
          created_at?: string
          from_user?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_delete_requests: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          requested_by: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          requested_by: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_delete_requests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_consumables: {
        Row: {
          asset_id: string
          attached_at: string
          attached_by: string
          consumable_type_id: string
          detached_at: string | null
          detached_by: string | null
          follows_parent: boolean
          id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          asset_id: string
          attached_at?: string
          attached_by: string
          consumable_type_id: string
          detached_at?: string | null
          detached_by?: string | null
          follows_parent?: boolean
          id?: string
          notes?: string | null
          quantity: number
        }
        Update: {
          asset_id?: string
          attached_at?: string
          attached_by?: string
          consumable_type_id?: string
          detached_at?: string | null
          detached_by?: string | null
          follows_parent?: boolean
          id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_consumables_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_consumables_consumable_type_id_fkey"
            columns: ["consumable_type_id"]
            isOneToOne: false
            referencedRelation: "consumable_type_totals"
            referencedColumns: ["consumable_type_id"]
          },
        ]
      }
      asset_requests: {
        Row: {
          admin_notes: string | null
          asset_id: string | null
          created_at: string
          id: string
          item_description: string | null
          needed_by: string | null
          needed_for: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          asset_id?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          needed_by?: string | null
          needed_for?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          asset_id?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          needed_by?: string | null
          needed_for?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_requests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_packet_items: {
        Row: {
          created_at: string
          division_id: string | null
          id: string
          line_label: string
          location_id: string | null
          notes: string | null
          packet_id: string
          preferred_asset_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          division_id?: string | null
          id?: string
          line_label: string
          location_id?: string | null
          notes?: string | null
          packet_id: string
          preferred_asset_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          division_id?: string | null
          id?: string
          line_label?: string
          location_id?: string | null
          notes?: string | null
          packet_id?: string
          preferred_asset_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_packet_items_packet_id_fkey"
            columns: ["packet_id"]
            isOneToOne: false
            referencedRelation: "bulk_packets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_packet_items_preferred_asset_id_fkey"
            columns: ["preferred_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      consumable_history: {
        Row: {
          action: string
          asset_id: string | null
          consumable_type_id: string
          created_at: string
          id: string
          location_id: string | null
          notes: string | null
          performed_by: string | null
          quantity: number
        }
        Insert: {
          action: string
          asset_id?: string | null
          consumable_type_id: string
          created_at?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity: number
        }
        Update: {
          action?: string
          asset_id?: string | null
          consumable_type_id?: string
          created_at?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity?: number
        }
        Relationships: []
      }
      consumable_stock: {
        Row: {
          consumable_type_id: string
          created_at: string
          id: string
          location_id: string
          notes: string | null
          quantity_available: number
          quantity_damaged: number
          updated_at: string
        }
        Insert: {
          consumable_type_id: string
          created_at?: string
          id?: string
          location_id: string
          notes?: string | null
          quantity_available?: number
          quantity_damaged?: number
          updated_at?: string
        }
        Update: {
          consumable_type_id?: string
          created_at?: string
          id?: string
          location_id?: string
          notes?: string | null
          quantity_available?: number
          quantity_damaged?: number
          updated_at?: string
        }
        Relationships: []
      }
      consumable_types: {
        Row: {
          created_at: string
          default_location_id: string | null
          description: string | null
          division_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_location_id?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_location_id?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_packets: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          code: string
          created_at: string
          current_holder: string | null
          current_location_id: string | null
          department_id: string
          description: string | null
          id: string
          item_type_id: string
          name: string
          notes: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_holder?: string | null
          current_location_id?: string | null
          department_id: string
          description?: string | null
          id?: string
          item_type_id: string
          name: string
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_holder?: string | null
          current_location_id?: string | null
          department_id?: string
          description?: string | null
          id?: string
          item_type_id?: string
          name?: string
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_item_type_id_fkey"
            columns: ["item_type_id"]
            isOneToOne: false
            referencedRelation: "item_types"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          is_storage: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_storage?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_storage?: boolean
          name?: string
        }
        Relationships: []
      }
      handover_items: {
        Row: {
          asset_id: string
          created_at: string
          handover_id: string
          id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          handover_id: string
          id?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          handover_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "handover_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handover_items_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "handovers"
            referencedColumns: ["id"]
          },
        ]
      }
      handovers: {
        Row: {
          created_at: string
          from_user: string
          id: string
          notes: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["handover_status"]
          to_user: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["handover_status"]
          to_user: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user?: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["handover_status"]
          to_user?: string
          updated_at?: string
        }
        Relationships: []
      }
      item_types: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          asset_manager_location_id: string | null
          created_at: string
          department_id: string | null
          display_name: string
          email: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          asset_manager_location_id?: string | null
          created_at?: string
          department_id?: string | null
          display_name: string
          email?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          asset_manager_location_id?: string | null
          created_at?: string
          department_id?: string | null
          display_name?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_asset_manager_location_id_fkey"
            columns: ["asset_manager_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_fk"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_donations: {
        Row: {
          created_at: string
          id: string
          note: string | null
          paid_amount: number
          person_name: string
          quoted_amount: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          paid_amount?: number
          person_name: string
          quoted_amount?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          paid_amount?: number
          person_name?: string
          quoted_amount?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      wedding_expenses: {
        Row: {
          created_at: string
          id: string
          item_name: string
          note: string | null
          paid_amount: number
          quoted_amount: number
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          note?: string | null
          paid_amount?: number
          quoted_amount?: number
          section: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          note?: string | null
          paid_amount?: number
          quoted_amount?: number
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      signout_items: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          returned: boolean
          signout_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          returned?: boolean
          signout_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          returned?: boolean
          signout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signout_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signout_items_signout_id_fkey"
            columns: ["signout_id"]
            isOneToOne: false
            referencedRelation: "signouts"
            referencedColumns: ["id"]
          },
        ]
      }
      signouts: {
        Row: {
          created_at: string
          expected_return: string | null
          id: string
          notes: string | null
          package_name: string | null
          signed_in_at: string | null
          signed_in_by: string | null
          signed_out_by: string
          signed_out_to: string
          status: Database["public"]["Enums"]["signout_status"]
          to_department_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_return?: string | null
          id?: string
          notes?: string | null
          package_name?: string | null
          signed_in_at?: string | null
          signed_in_by?: string | null
          signed_out_by: string
          signed_out_to: string
          status?: Database["public"]["Enums"]["signout_status"]
          to_department_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_return?: string | null
          id?: string
          notes?: string | null
          package_name?: string | null
          signed_in_at?: string | null
          signed_in_by?: string | null
          signed_out_by?: string
          signed_out_to?: string
          status?: Database["public"]["Enums"]["signout_status"]
          to_department_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signouts_to_department_id_fkey"
            columns: ["to_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      asset_consumables_active: {
        Row: {
          asset_code: string
          asset_id: string
          asset_name: string
          asset_status: string
          attached_at: string
          attached_by: string
          consumable_name: string
          consumable_type_id: string
          follows_parent: boolean
          id: string
          notes: string | null
          quantity: number
        }
        Relationships: []
      }
      consumable_type_totals: {
        Row: {
          assigned: number
          consumable_type_id: string
          damaged: number
          default_location_id: string | null
          description: string | null
          division_id: string | null
          in_stock: number
          name: string
          permanently_checked_out: number
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: void
      }
      admin_assign_user_role: {
        Args: {
          next_asset_manager_location_id?: string | null
          next_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
      approve_asset_request: {
        Args: { admin_notes?: string | null; target_request_id: string }
        Returns: Json
      }
      add_consumable_stock: {
        Args: {
          quantity_to_add: number
          stock_notes?: string | null
          target_consumable_type_id: string
          target_location_id: string
        }
        Returns: Json
      }
      adjust_consumable_stock_damage: {
        Args: {
          adjustment_notes?: string | null
          move_to_damaged?: boolean
          quantity_to_move: number
          target_consumable_type_id: string
          target_location_id: string
        }
        Returns: Json
      }
      admin_override_parent_without_consumables: {
        Args: { override_notes?: string | null; target_asset_ids: string[] }
        Returns: Json
      }
      attach_consumable_to_asset: {
        Args: {
          attach_notes?: string | null
          follows_parent_by_default?: boolean
          quantity_to_attach: number
          source_location_id: string
          target_asset_id: string
          target_consumable_type_id: string
        }
        Returns: Json
      }
      can_manage_consumables: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      create_consumable_type: {
        Args: {
          target_default_location_id?: string | null
          target_description?: string | null
          target_division_id?: string | null
          target_name: string
        }
        Returns: Json
      }
      detach_consumable_from_asset: {
        Args: {
          destination_location_id: string
          detach_notes?: string | null
          move_to_damaged?: boolean
          quantity_to_detach: number
          target_asset_id: string
          target_consumable_type_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
      reassign_consumable_to_asset: {
        Args: {
          from_asset_id: string
          quantity_to_move: number
          reassign_notes?: string | null
          target_consumable_type_id: string
          target_follows_parent?: boolean
          to_asset_id: string
        }
        Returns: Json
      }
      sign_in_assets: {
        Args: {
          note_prefix?: string | null
          notes?: string | null
          signin_payload: Json
          target_location_id: string
        }
        Returns: Json
      }
      sign_in_assets_safe: {
        Args: {
          note_prefix?: string | null
          notes?: string | null
          signin_payload: Json
          target_location_id: string
        }
        Returns: Json
      }
      sign_out_assets: {
        Args: {
          history_notes_by_asset?: Json
          notes?: string | null
          package_name?: string | null
          recipient_user_id?: string | null
          target_asset_ids: string[]
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "volunteer" | "asset_manager"
      asset_status:
        | "available"
        | "signed_out"
        | "in_handover"
        | "out_for_repairs"
        | "permanent"
        | "not_assigned"
        | "lost"
        | "damaged"
      handover_status: "pending" | "accepted" | "rejected" | "cancelled"
      request_status: "pending" | "approved" | "rejected" | "fulfilled"
      signout_status: "active" | "returned" | "overdue"
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
      app_role: ["admin", "staff", "volunteer", "asset_manager"],
      asset_status: [
        "available",
        "signed_out",
        "in_handover",
        "out_for_repairs",
        "permanent",
        "not_assigned",
        "lost",
        "damaged",
      ],
      handover_status: ["pending", "accepted", "rejected", "cancelled"],
      request_status: ["pending", "approved", "rejected", "fulfilled"],
      signout_status: ["active", "returned", "overdue"],
    },
  },
} as const
