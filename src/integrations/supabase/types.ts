export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "pastor" | "operator" | "cafe";

export type CoffeeType = string;
export type MilkType = string;
export type SugarType = string;
export type HeatLevel = string;
export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderType = "normal" | "preacher";
export type OrderFormType = "normal" | "preacher";
export type OrderFieldKey =
  | "coffee_type"
  | "milk_type"
  | "sugar_type"
  | "milk_heat"
  | "extra_item"
  | "eats_item"
  | "eats_option"
  | "sweet_chili_option";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          profile_notes: string | null;
          approved: boolean;
          approved_at: string | null;
          approved_by: string | null;
          requested_role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          profile_notes?: string | null;
          approved?: boolean;
          approved_at?: string | null;
          approved_by?: string | null;
          requested_role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          profile_notes?: string | null;
          approved?: boolean;
          approved_at?: string | null;
          approved_by?: string | null;
          requested_role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          created_at?: string;
        };
        Relationships: [];
      };
      coffee_preferences: {
        Row: {
          id: string;
          user_id: string;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          milk_heat: HeatLevel;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          milk_heat: HeatLevel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          coffee_type?: CoffeeType;
          milk_type?: MilkType;
          sugar_type?: SugarType;
          milk_heat?: HeatLevel;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coffee_orders: {
        Row: {
          id: string;
          created_by: string;
          pastor_id: string | null;
          order_type: OrderType;
          recipient_name: string;
          guest_name: string | null;
          guest_details: string | null;
          custom_extra_items: string | null;
          preacher_extras: Json | null;
          special_order_kind: string | null;
          eats_item: string | null;
          eats_option: string | null;
          sweet_chili_option: string | null;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          milk_heat: HeatLevel;
          notes: string | null;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          pastor_id?: string | null;
          order_type?: OrderType;
          recipient_name: string;
          guest_name?: string | null;
          guest_details?: string | null;
          custom_extra_items?: string | null;
          preacher_extras?: Json | null;
          special_order_kind?: string | null;
          eats_item?: string | null;
          eats_option?: string | null;
          sweet_chili_option?: string | null;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          milk_heat: HeatLevel;
          notes?: string | null;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          pastor_id?: string | null;
          order_type?: OrderType;
          recipient_name?: string;
          guest_name?: string | null;
          guest_details?: string | null;
          custom_extra_items?: string | null;
          preacher_extras?: Json | null;
          special_order_kind?: string | null;
          eats_item?: string | null;
          eats_option?: string | null;
          sweet_chili_option?: string | null;
          coffee_type?: CoffeeType;
          milk_type?: MilkType;
          sugar_type?: SugarType;
          milk_heat?: HeatLevel;
          notes?: string | null;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_form_options: {
        Row: {
          id: string;
          form_type: OrderFormType;
          field_key: OrderFieldKey;
          label: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_type: OrderFormType;
          field_key: OrderFieldKey;
          label: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_type?: OrderFormType;
          field_key?: OrderFieldKey;
          label?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
