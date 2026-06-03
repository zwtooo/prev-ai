export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          role_job: string | null;
          age: number | null;
          height: string | null;
          weight: string | null;
          goal: string | null;
          streak: number;
          total_sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          role_job?: string | null;
          age?: number | null;
          height?: string | null;
          weight?: string | null;
          goal?: string | null;
          streak?: number;
          total_sessions?: number;
        };
        Update: {
          name?: string;
          email?: string | null;
          role_job?: string | null;
          age?: number | null;
          height?: string | null;
          weight?: string | null;
          goal?: string | null;
          streak?: number;
          total_sessions?: number;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          time: string;
          days: string[];
          active: boolean;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          time: string;
          days: string[];
          active?: boolean;
          icon?: string;
          color?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          time?: string;
          days?: string[];
          active?: boolean;
          icon?: string;
          color?: string;
        };
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          routine_id: number | null;
          routine_title: string | null;
          duration_minutes: number;
          category: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          routine_id?: number | null;
          routine_title?: string | null;
          duration_minutes: number;
          category?: string;
          completed_at?: string;
        };
        Update: {
          duration_minutes?: number;
          category?: string;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          completed_date: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          completed?: boolean;
          completed_date?: string | null;
        };
        Update: {
          title?: string;
          completed?: boolean;
          completed_date?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: "user" | "assistant";
          content: string;
        };
        Update: never;
      };
    };
  };
};
