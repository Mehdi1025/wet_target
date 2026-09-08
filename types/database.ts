export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = "pending" | "active" | "review" | "completed";
export type ProjectStep = "discovery" | "strategy" | "creation" | "launch";
export type ServiceId =
  | "branding"
  | "sites-web"
  | "reseaux-sociaux"
  | "publicite"
  | "automatisation";

export type ContactStatus = "new" | "read" | "replied" | "archived";
export type ExternalCostStatus = "pending" | "paid";
export type ExternalCostType = "contractor" | "project_charge";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "high" | "normal" | "low";

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          account_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          account_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          account_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          company: string | null;
          message: string;
          source_page: string | null;
          locale: string;
          status: ContactStatus;
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message: string;
          source_page?: string | null;
          locale?: string;
          status?: ContactStatus;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          source_page?: string | null;
          locale?: string;
          status?: ContactStatus;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_submissions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_services: {
        Row: {
          project_id: string;
          service_id: ServiceId;
          budget_share: number;
          created_at: string;
        };
        Insert: {
          project_id: string;
          service_id: ServiceId;
          budget_share?: number;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          service_id?: ServiceId;
          budget_share?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_services_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          client_id: string;
          status: ProjectStatus;
          current_step: ProjectStep;
          deadline: string | null;
          budget: number | null;
          allocated_days: number;
          spent_days: number;
          spent_seconds: number;
          figma_url: string | null;
          drive_url: string | null;
          staging_url: string | null;
          crm_lead_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          client_id: string;
          status?: ProjectStatus;
          current_step?: ProjectStep;
          deadline?: string | null;
          budget?: number | null;
          allocated_days?: number;
          spent_days?: number;
          spent_seconds?: number;
          figma_url?: string | null;
          drive_url?: string | null;
          staging_url?: string | null;
          crm_lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          client_id?: string;
          status?: ProjectStatus;
          current_step?: ProjectStep;
          deadline?: string | null;
          budget?: number | null;
          allocated_days?: number;
          spent_days?: number;
          spent_seconds?: number;
          figma_url?: string | null;
          drive_url?: string | null;
          staging_url?: string | null;
          crm_lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      project_external_costs: {
        Row: {
          id: string;
          project_id: string;
          cost_type: ExternalCostType;
          freelance_name: string | null;
          role: string;
          cost_amount: number;
          status: ExternalCostStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          cost_type?: ExternalCostType;
          freelance_name?: string | null;
          role: string;
          cost_amount: number;
          status?: ExternalCostStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          cost_type?: ExternalCostType;
          freelance_name?: string | null;
          role?: string;
          cost_amount?: number;
          status?: ExternalCostStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_external_costs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      time_logs: {
        Row: {
          id: string;
          project_id: string;
          user_id: string | null;
          admin_username: string | null;
          start_time: string;
          end_time: string | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id?: string | null;
          admin_username?: string | null;
          start_time?: string;
          end_time?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string | null;
          admin_username?: string | null;
          start_time?: string;
          end_time?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          assignee: string | null;
          due_date: string | null;
          step: ProjectStep | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assignee?: string | null;
          due_date?: string | null;
          step?: ProjectStep | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assignee?: string | null;
          due_date?: string | null;
          step?: ProjectStep | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      arsenal_drawers: {
        Row: {
          id: string;
          title: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      arsenal_links: {
        Row: {
          id: string;
          drawer_id: string;
          name: string;
          description: string | null;
          url: string;
          icon_key: string;
          accent_class: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          drawer_id: string;
          name: string;
          description?: string | null;
          url: string;
          icon_key?: string;
          accent_class?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          drawer_id?: string;
          name?: string;
          description?: string | null;
          url?: string;
          icon_key?: string;
          accent_class?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "arsenal_links_drawer_id_fkey";
            columns: ["drawer_id"];
            isOneToOne: false;
            referencedRelation: "arsenal_drawers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: ProjectStatus;
      project_step: ProjectStep;
      project_task_status: TaskStatus;
      project_task_priority: TaskPriority;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Project row joined with client + service ids (for dashboards). */
export type ProjectWithClient = Database["public"]["Tables"]["projects"]["Row"] & {
  client: Database["public"]["Tables"]["clients"]["Row"];
  service_ids: ServiceId[];
};

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectTaskRow = Database["public"]["Tables"]["project_tasks"]["Row"];
export type ContactRow = Database["public"]["Tables"]["contact_submissions"]["Row"];
