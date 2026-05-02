export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "pastor" | "operator";

export type CoffeeType = "Cappachino" | "Flat White" | "Cortado" | "Latte";
export type MilkType = "Fresh Milk" | "Lactose Free" | "Oat Milk" | "Almond Milk";
export type SugarType = "1 Sugar" | "2 Suger" | "3 Suger" | "Sweetner";
export type HeatLevel =
  | "55 degrees"
  | "56 degrees"
  | "57 degrees"
  | "58 degrees"
  | "59 degrees"
  | "60 degrees"
  | "61 degrees"
  | "62 degrees"
  | "63 degrees"
  | "64 degrees"
  | "65 degrees"
  | "66 degrees"
  | "67 degrees"
  | "68 degrees"
  | "69 degrees"
  | "70 degrees";
export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderType = "normal" | "preacher";

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
