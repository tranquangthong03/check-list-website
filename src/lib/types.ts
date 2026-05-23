export type PlanStatus = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type DailyPlan = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  plan_date: string;
  start_time: string;
  end_time: string;
  status: PlanStatus;
  priority: Priority;
  category: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  user_id: string;
  content: string;
  plan_date: string;
  is_done: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string;
};

export type QuickLink = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  icon: string | null;
  category: string | null;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      daily_plans: {
        Row: DailyPlan;
        Insert: Omit<DailyPlan, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DailyPlan, "id" | "user_id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
      };
      checklist_items: {
        Row: ChecklistItem;
        Insert: Omit<ChecklistItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChecklistItem, "id" | "user_id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
      };
      quick_links: {
        Row: QuickLink;
        Insert: Omit<QuickLink, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<QuickLink, "id" | "user_id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
      };
    };
  };
};
