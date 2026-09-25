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
      access_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_messages: {
        Row: {
          content: string
          context_paths: string[]
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          content: string
          context_paths?: string[]
          created_at?: string
          id?: string
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          content?: string
          context_paths?: string[]
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_ledger: {
        Row: {
          actor: string
          block_hash: string
          created_at: string
          event: string
          id: number
          payload: Json
          prev_hash: string
          seq: number
          tenant_id: string
        }
        Insert: {
          actor: string
          block_hash: string
          created_at?: string
          event: string
          id?: number
          payload?: Json
          prev_hash: string
          seq: number
          tenant_id: string
        }
        Update: {
          actor?: string
          block_hash?: string
          created_at?: string
          event?: string
          id?: number
          payload?: Json
          prev_hash?: string
          seq?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          headcount: number
          id: string
          loaded_hourly_rate: number
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          headcount?: number
          id?: string
          loaded_hourly_rate?: number
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          headcount?: number
          id?: string
          loaded_hourly_rate?: number
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          analysis_summary: string | null
          analyzed_at: string | null
          content: string
          covered_controls: string[]
          created_at: string
          created_by: string | null
          created_by_email: string | null
          framework: string | null
          id: string
          image_data: string | null
          kind: string
          tenant_id: string
          title: string
        }
        Insert: {
          analysis_summary?: string | null
          analyzed_at?: string | null
          content?: string
          covered_controls?: string[]
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          framework?: string | null
          id?: string
          image_data?: string | null
          kind: string
          tenant_id: string
          title: string
        }
        Update: {
          analysis_summary?: string | null
          analyzed_at?: string | null
          content?: string
          covered_controls?: string[]
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          framework?: string | null
          id?: string
          image_data?: string | null
          kind?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_runs: {
        Row: {
          created_at: string
          created_by: string | null
          decision: Json
          department_id: string | null
          id: string
          minutes_saved: number
          operator_label: string
          status: string
          task: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          decision?: Json
          department_id?: string | null
          id?: string
          minutes_saved?: number
          operator_label: string
          status?: string
          task: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          decision?: Json
          department_id?: string | null
          id?: string
          minutes_saved?: number
          operator_label?: string
          status?: string
          task?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_runs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
        }
        Insert: {
          group_id: string
          user_id: string
        }
        Update: {
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_permissions: {
        Row: {
          group_id: string
          permission: string
        }
        Insert: {
          group_id: string
          permission: string
        }
        Update: {
          group_id?: string
          permission?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_permissions_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string | null
          display_name: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          mime_type: string | null
          pinned: boolean
          size_bytes: number | null
          storage_path: string | null
          tags: string[]
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          mime_type?: string | null
          pinned?: boolean
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          mime_type?: string | null
          pinned?: boolean
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      member_roles: {
        Row: {
          created_at: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "tenant_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          area: string
          description: string
          key: string
        }
        Insert: {
          area: string
          description: string
          key: string
        }
        Update: {
          area?: string
          description?: string
          key?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission: string
          role_id: string
        }
        Insert: {
          permission: string
          role_id: string
        }
        Update: {
          permission?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "tenant_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_findings: {
        Row: {
          control_id: string
          created_at: string
          due_date: string | null
          evidence_id: string | null
          gap: string
          id: string
          owner_email: string | null
          priority: number
          remediation: string
          severity: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          control_id: string
          created_at?: string
          due_date?: string | null
          evidence_id?: string | null
          gap: string
          id?: string
          owner_email?: string | null
          priority?: number
          remediation: string
          severity: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          control_id?: string
          created_at?: string
          due_date?: string | null
          evidence_id?: string | null
          gap?: string
          id?: string
          owner_email?: string | null
          priority?: number
          remediation?: string
          severity?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_findings_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_findings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          sector: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sector?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sector?: string
          slug?: string
        }
        Relationships: []
      }
      user_permission_overrides: {
        Row: {
          created_at: string
          effect: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          effect: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          effect?: string
          permission?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "user_permission_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      append_ledger: {
        Args: { _event: string; _payload: Json; _tenant: string }
        Returns: {
          actor: string
          block_hash: string
          created_at: string
          event: string
          id: number
          payload: Json
          prev_hash: string
          seq: number
          tenant_id: string
        }
        SetofOptions: {
          from: "*"
          to: "audit_ledger"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_permission: {
        Args: { _perm: string; _tenant: string; _user: string }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _tenant: string
          _user: string
        }
        Returns: boolean
      }
      is_member: { Args: { _tenant: string; _user: string }; Returns: boolean }
      ledger_append_internal: {
        Args: {
          _actor: string
          _event: string
          _payload: Json
          _tenant: string
          _ts?: string
        }
        Returns: {
          actor: string
          block_hash: string
          created_at: string
          event: string
          id: number
          payload: Json
          prev_hash: string
          seq: number
          tenant_id: string
        }
        SetofOptions: {
          from: "*"
          to: "audit_ledger"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ledger_hash: {
        Args: {
          _actor: string
          _event: string
          _payload: Json
          _prev: string
          _ts: string
        }
        Returns: string
      }
      my_permissions: { Args: { _tenant: string }; Returns: string[] }
      verify_ledger: {
        Args: { _tamper_payload?: Json; _tamper_seq?: number; _tenant: string }
        Returns: {
          computed_hash: string
          event: string
          hash_ok: boolean
          link_ok: boolean
          seq: number
          stored_hash: string
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "operator" | "auditor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["owner", "admin", "operator", "auditor"],
    },
  },
} as const
