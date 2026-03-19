export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          slug: string;
          date: string;
          time: string;
          place: string;
          people_needed: number;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          date: string;
          time: string;
          place: string;
          people_needed: number;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          date?: string;
          time?: string;
          place?: string;
          people_needed?: number;
          duration?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      attendees: {
        Row: {
          id: string;
          game_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendees_game_id_fkey";
            columns: ["game_id"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          slug: string;
          game_id: string;
          player_name: string;
          declined: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          game_id: string;
          player_name: string;
          declined?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          game_id?: string;
          player_name?: string;
          declined?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invites_game_id_fkey";
            columns: ["game_id"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Attendee = Database["public"]["Tables"]["attendees"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Invite = Database["public"]["Tables"]["invites"]["Row"];
