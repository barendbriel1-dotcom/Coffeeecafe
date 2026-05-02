export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "pastor" | "operator" | "volunteer";

export type CoffeeType = "Cappachino" | "Flat White" | "Cortado" | "Latte";
export type MilkType = "Fresh Milk" | "Lactose Free" | "Oat Milk" | "Almond Milk";
export type SugarType = "1 Sugar" | "2 Suger" | "3 Suger" | "Sweetner";
export type OrderStatus = "pending" | "preparing" | "completed" | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          coffee_type?: CoffeeType;
          milk_type?: MilkType;
          sugar_type?: SugarType;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coffee_orders: {
        Row: {
          id: string;
          created_by: string;
          recipient_name: string;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          notes: string | null;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          recipient_name: string;
          coffee_type: CoffeeType;
          milk_type: MilkType;
          sugar_type: SugarType;
          notes?: string | null;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          recipient_name?: string;
          coffee_type?: CoffeeType;
          milk_type?: MilkType;
          sugar_type?: SugarType;
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
