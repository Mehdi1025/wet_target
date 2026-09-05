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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
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
          created_at: string;
        };
        Insert: {
          project_id: string;
          service_id: ServiceId;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          service_id?: ServiceId;
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
          figma_url: string | null;
          drive_url: string | null;
          staging_url: string | null;
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
          figma_url?: string | null;
          drive_url?: string | null;
          staging_url?: string | null;
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
          figma_url?: string | null;
          drive_url?: string | null;
          staging_url?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: ProjectStatus;
      project_step: ProjectStep;
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
export type ContactRow = Database["public"]["Tables"]["contact_submissions"]["Row"];
