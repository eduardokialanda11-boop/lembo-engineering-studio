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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assembly_step_components: {
        Row: {
          assembly_step_id: string
          component_id: string
          component_order: number | null
          created_at: string | null
          id: string
          notes: string | null
          project_id: string
          role: string | null
        }
        Insert: {
          assembly_step_id: string
          component_id: string
          component_order?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id: string
          role?: string | null
        }
        Update: {
          assembly_step_id?: string
          component_id?: string
          component_order?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assembly_component_project_fk"
            columns: ["component_id", "project_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "assembly_step_components_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_step_project_fk"
            columns: ["assembly_step_id", "project_id"]
            isOneToOne: false
            referencedRelation: "assembly_steps"
            referencedColumns: ["id", "project_id"]
          },
        ]
      }
      assembly_steps: {
        Row: {
          component_name: string
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          instruction: string
          project_id: string
          safety_notes: string | null
          step_number: number
          step_type: string | null
          title: string
          tools_required: Json | null
          visual_data: Json | null
          visual_reference: string | null
          visual_type: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          instruction: string
          project_id: string
          safety_notes?: string | null
          step_number: number
          step_type?: string | null
          title: string
          tools_required?: Json | null
          visual_data?: Json | null
          visual_reference?: string | null
          visual_type?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          instruction?: string
          project_id?: string
          safety_notes?: string | null
          step_number?: number
          step_type?: string | null
          title?: string
          tools_required?: Json | null
          visual_data?: Json | null
          visual_reference?: string | null
          visual_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assembly_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          image_emoji: string | null
          manufacturing_process: string | null
          material: string | null
          measurement_source: string | null
          name: string
          order_index: number | null
          piece_image_url: string | null
          project_id: string
          quantity: number
          technical_description: string | null
          user_measure: string | null
          validation_status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_emoji?: string | null
          manufacturing_process?: string | null
          material?: string | null
          measurement_source?: string | null
          name: string
          order_index?: number | null
          piece_image_url?: string | null
          project_id: string
          quantity?: number
          technical_description?: string | null
          user_measure?: string | null
          validation_status?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_emoji?: string | null
          manufacturing_process?: string | null
          material?: string | null
          measurement_source?: string | null
          name?: string
          order_index?: number | null
          piece_image_url?: string | null
          project_id?: string
          quantity?: number
          technical_description?: string | null
          user_measure?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "components_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_dimensions: {
        Row: {
          component_id: string | null
          created_at: string | null
          geometry_reference: Json | null
          id: string
          label: string
          measurement_source: string
          project_id: string
          unit: string | null
          updated_at: string | null
          validation_status: string
          value: number | null
          view_name: string | null
        }
        Insert: {
          component_id?: string | null
          created_at?: string | null
          geometry_reference?: Json | null
          id?: string
          label: string
          measurement_source?: string
          project_id: string
          unit?: string | null
          updated_at?: string | null
          validation_status?: string
          value?: number | null
          view_name?: string | null
        }
        Update: {
          component_id?: string | null
          created_at?: string | null
          geometry_reference?: Json | null
          id?: string
          label?: string
          measurement_source?: string
          project_id?: string
          unit?: string | null
          updated_at?: string | null
          validation_status?: string
          value?: number | null
          view_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_dimensions_component_project_fk"
            columns: ["component_id", "project_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "project_dimensions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          drawing_image_url: string | null
          id: string
          image_url: string
          parts_data: Json
          reference_measure: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          drawing_image_url?: string | null
          id?: string
          image_url: string
          parts_data: Json
          reference_measure?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          drawing_image_url?: string | null
          id?: string
          image_url?: string
          parts_data?: Json
          reference_measure?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      lembo_save_analysis: {
        Args: {
          p_assembly_steps?: Json
          p_components?: Json
          p_dimensions?: Json
          p_project: Json
          p_step_components?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
