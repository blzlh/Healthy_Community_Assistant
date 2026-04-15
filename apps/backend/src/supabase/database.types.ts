export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_admin: boolean;
          is_banned: boolean;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
        };
        Update: {
          user_id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
