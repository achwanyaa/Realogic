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
      audit_log: {
        Row: {
          action: string
          actor: string | null
          client_id: string | null
          created_at: string
          id: number
          new_row: Json | null
          old_row: Json | null
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor?: string | null
          client_id?: string | null
          created_at?: string
          id?: never
          new_row?: Json | null
          old_row?: Json | null
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor?: string | null
          client_id?: string | null
          created_at?: string
          id?: never
          new_row?: Json | null
          old_row?: Json | null
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          attendees: number
          buyer_id: string
          client_id: string
          confirmed_for: string | null
          created_at: string
          id: string
          preferred_day: string
          preferred_time: Database["public"]["Enums"]["day_part"]
          property_id: string
          purpose: Database["public"]["Enums"]["booking_purpose"]
          questions: string | null
          staff_notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          attendees?: number
          buyer_id: string
          client_id: string
          confirmed_for?: string | null
          created_at?: string
          id?: string
          preferred_day: string
          preferred_time: Database["public"]["Enums"]["day_part"]
          property_id: string
          purpose?: Database["public"]["Enums"]["booking_purpose"]
          questions?: string | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          attendees?: number
          buyer_id?: string
          client_id?: string
          confirmed_for?: string | null
          created_at?: string
          id?: string
          preferred_day?: string
          preferred_time?: Database["public"]["Enums"]["day_part"]
          property_id?: string
          purpose?: Database["public"]["Enums"]["booking_purpose"]
          questions?: string | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          company: string | null
          consent_at: string
          consent_version: string
          created_at: string
          email: string | null
          full_name: string
          industry_key: string | null
          needs: Json
          phone: string | null
          role_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          consent_at: string
          consent_version: string
          created_at?: string
          email?: string | null
          full_name: string
          industry_key?: string | null
          needs?: Json
          phone?: string | null
          role_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          consent_at?: string
          consent_version?: string
          created_at?: string
          email?: string | null
          full_name?: string
          industry_key?: string | null
          needs?: Json
          phone?: string | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_industry_key_fkey"
            columns: ["industry_key"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["key"]
          },
        ]
      }
      clients: {
        Row: {
          briefing_recipients: string[]
          created_at: string
          domain: string | null
          email: string | null
          id: string
          legal_name: string | null
          licence_status: string
          logo_path: string | null
          name: string
          phone: string | null
          postal_address: string | null
          slug: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          briefing_recipients?: string[]
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          licence_status?: string
          logo_path?: string | null
          name: string
          phone?: string | null
          postal_address?: string | null
          slug: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          briefing_recipients?: string[]
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          licence_status?: string
          logo_path?: string | null
          name?: string
          phone?: string | null
          postal_address?: string | null
          slug?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      correction_requests: {
        Row: {
          client_id: string
          created_at: string
          id: string
          message: string
          property_id: string
          requested_by: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          spec_value_id: string | null
          status: Database["public"]["Enums"]["correction_status"]
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          message: string
          property_id: string
          requested_by: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          spec_value_id?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          message?: string
          property_id?: string
          requested_by?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          spec_value_id?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
        }
        Relationships: [
          {
            foreignKeyName: "correction_requests_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
          {
            foreignKeyName: "correction_requests_spec_value_id_fkey"
            columns: ["spec_value_id"]
            isOneToOne: false
            referencedRelation: "spec_values"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          author: string
          client_id: string
          created_at: string
          document_date: string | null
          file_path: string | null
          id: string
          note: string | null
          number: string | null
          property_id: string
          revision: string | null
          title: string
          visibility: Database["public"]["Enums"]["document_visibility"]
        }
        Insert: {
          author: string
          client_id: string
          created_at?: string
          document_date?: string | null
          file_path?: string | null
          id?: string
          note?: string | null
          number?: string | null
          property_id: string
          revision?: string | null
          title: string
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Update: {
          author?: string
          client_id?: string
          created_at?: string
          document_date?: string | null
          file_path?: string | null
          id?: string
          note?: string | null
          number?: string | null
          property_id?: string
          revision?: string | null
          title?: string
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      events: {
        Row: {
          buyer_id: string | null
          client_id: string
          created_at: string
          id: number
          meta: Json
          property_id: string | null
          type: Database["public"]["Enums"]["event_type"]
        }
        Insert: {
          buyer_id?: string | null
          client_id: string
          created_at?: string
          id?: never
          meta?: Json
          property_id?: string | null
          type: Database["public"]["Enums"]["event_type"]
        }
        Update: {
          buyer_id?: string | null
          client_id?: string
          created_at?: string
          id?: never
          meta?: Json
          property_id?: string | null
          type?: Database["public"]["Enums"]["event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      fit_results: {
        Row: {
          buyer_id: string
          client_id: string
          created_at: string
          id: string
          industry_key: string
          property_id: string
          result_rows: Json
          verdict: Database["public"]["Enums"]["fit_verdict"]
        }
        Insert: {
          buyer_id: string
          client_id: string
          created_at?: string
          id?: string
          industry_key: string
          property_id: string
          result_rows?: Json
          verdict: Database["public"]["Enums"]["fit_verdict"]
        }
        Update: {
          buyer_id?: string
          client_id?: string
          created_at?: string
          id?: string
          industry_key?: string
          property_id?: string
          result_rows?: Json
          verdict?: Database["public"]["Enums"]["fit_verdict"]
        }
        Relationships: [
          {
            foreignKeyName: "fit_results_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fit_results_industry_key_fkey"
            columns: ["industry_key"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "fit_results_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      industries: {
        Row: {
          active: boolean
          description: string | null
          key: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          description?: string | null
          key: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          description?: string | null
          key?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      industry_requirements: {
        Row: {
          fix_note: string | null
          fixable: boolean
          id: string
          industry_key: string
          need_text: string
          reasoning: string | null
          rule: Database["public"]["Enums"]["requirement_rule"]
          sort_order: number
          spec_key: string
          threshold: number | null
        }
        Insert: {
          fix_note?: string | null
          fixable?: boolean
          id?: string
          industry_key: string
          need_text: string
          reasoning?: string | null
          rule: Database["public"]["Enums"]["requirement_rule"]
          sort_order?: number
          spec_key: string
          threshold?: number | null
        }
        Update: {
          fix_note?: string | null
          fixable?: boolean
          id?: string
          industry_key?: string
          need_text?: string
          reasoning?: string | null
          rule?: Database["public"]["Enums"]["requirement_rule"]
          sort_order?: number
          spec_key?: string
          threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_requirements_industry_key_fkey"
            columns: ["industry_key"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "industry_requirements_spec_key_fkey"
            columns: ["spec_key"]
            isOneToOne: false
            referencedRelation: "spec_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      leads: {
        Row: {
          buyer_id: string
          client_id: string
          created_at: string
          id: string
          notes: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          availability_note: string | null
          available_from: string | null
          client_id: string
          created_at: string
          currency: string
          deal: Database["public"]["Enums"]["deal_type"]
          description: string | null
          id: string
          price: number | null
          price_on_request: boolean
          price_period: string | null
          property_id: string
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          availability_note?: string | null
          available_from?: string | null
          client_id: string
          created_at?: string
          currency?: string
          deal: Database["public"]["Enums"]["deal_type"]
          description?: string | null
          id?: string
          price?: number | null
          price_on_request?: boolean
          price_period?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          availability_note?: string | null
          available_from?: string | null
          client_id?: string
          created_at?: string
          currency?: string
          deal?: Database["public"]["Enums"]["deal_type"]
          description?: string | null
          id?: string
          price?: number | null
          price_on_request?: boolean
          price_period?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      media: {
        Row: {
          caption: string | null
          client_id: string
          created_at: string
          file_path: string | null
          id: string
          is_main: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          property_id: string
          sort_order: number
          url: string | null
        }
        Insert: {
          caption?: string | null
          client_id: string
          created_at?: string
          file_path?: string | null
          id?: string
          is_main?: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          property_id: string
          sort_order?: number
          url?: string | null
        }
        Update: {
          caption?: string | null
          client_id?: string
          created_at?: string
          file_path?: string | null
          id?: string
          is_main?: boolean
          kind?: Database["public"]["Enums"]["media_kind"]
          property_id?: string
          sort_order?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          area_label: string | null
          client_id: string
          created_at: string
          designed_by: string | null
          developed_by: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          near: string | null
          property_type: string
          published_at: string | null
          reference: string
          site_visited_on: string | null
          slug: string
          status: Database["public"]["Enums"]["property_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_label?: string | null
          client_id: string
          created_at?: string
          designed_by?: string | null
          developed_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          near?: string | null
          property_type?: string
          published_at?: string | null
          reference: string
          site_visited_on?: string | null
          slug: string
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_label?: string | null
          client_id?: string
          created_at?: string
          designed_by?: string | null
          developed_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          near?: string | null
          property_type?: string
          published_at?: string | null
          reference?: string
          site_visited_on?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          buyer_id: string
          client_id: string
          created_at: string
          property_id: string
        }
        Insert: {
          buyer_id: string
          client_id: string
          created_at?: string
          property_id: string
        }
        Update: {
          buyer_id?: string
          client_id?: string
          created_at?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_properties_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      spaces: {
        Row: {
          area_m2: number | null
          client_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["space_kind"]
          name: string
          property_id: string
          sort_order: number
        }
        Insert: {
          area_m2?: number | null
          client_id: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["space_kind"]
          name: string
          property_id: string
          sort_order?: number
        }
        Update: {
          area_m2?: number | null
          client_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["space_kind"]
          name?: string
          property_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "spaces_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
        ]
      }
      spec_definitions: {
        Row: {
          headline_label: string | null
          in_headline: boolean
          key: string
          name: string
          property_type: string
          recheck_days: number | null
          required_to_publish: boolean
          sort_order: number
          spec_group: string
          unit: string | null
          value_type: Database["public"]["Enums"]["spec_value_type"]
        }
        Insert: {
          headline_label?: string | null
          in_headline?: boolean
          key: string
          name: string
          property_type?: string
          recheck_days?: number | null
          required_to_publish?: boolean
          sort_order?: number
          spec_group: string
          unit?: string | null
          value_type?: Database["public"]["Enums"]["spec_value_type"]
        }
        Update: {
          headline_label?: string | null
          in_headline?: boolean
          key?: string
          name?: string
          property_type?: string
          recheck_days?: number | null
          required_to_publish?: boolean
          sort_order?: number
          spec_group?: string
          unit?: string | null
          value_type?: Database["public"]["Enums"]["spec_value_type"]
        }
        Relationships: []
      }
      spec_value_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          client_id: string
          id: number
          old_row: Json
          operation: string
          property_id: string
          spec_key: string
          spec_value_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          client_id: string
          id?: never
          old_row: Json
          operation: string
          property_id: string
          spec_key: string
          spec_value_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          client_id?: string
          id?: never
          old_row?: Json
          operation?: string
          property_id?: string
          spec_key?: string
          spec_value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spec_value_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      spec_values: {
        Row: {
          checked_by: string | null
          checked_on: string | null
          client_id: string
          created_at: string
          display_value: string
          document_id: string | null
          id: string
          label: Database["public"]["Enums"]["provenance_label"]
          method: string | null
          note: string | null
          property_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          space_id: string | null
          spec_key: string
          unit: string | null
          updated_at: string
          value_boolean: boolean | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          checked_by?: string | null
          checked_on?: string | null
          client_id: string
          created_at?: string
          display_value: string
          document_id?: string | null
          id?: string
          label?: Database["public"]["Enums"]["provenance_label"]
          method?: string | null
          note?: string | null
          property_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          space_id?: string | null
          spec_key: string
          unit?: string | null
          updated_at?: string
          value_boolean?: boolean | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          checked_by?: string | null
          checked_on?: string | null
          client_id?: string
          created_at?: string
          display_value?: string
          document_id?: string | null
          id?: string
          label?: Database["public"]["Enums"]["provenance_label"]
          method?: string | null
          note?: string | null
          property_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          space_id?: string | null
          spec_key?: string
          unit?: string | null
          updated_at?: string
          value_boolean?: boolean | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spec_values_document_id_property_id_fkey"
            columns: ["document_id", "property_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "property_id"]
          },
          {
            foreignKeyName: "spec_values_property_id_client_id_fkey"
            columns: ["property_id", "client_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id", "client_id"]
          },
          {
            foreignKeyName: "spec_values_space_id_property_id_fkey"
            columns: ["space_id", "property_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id", "property_id"]
          },
          {
            foreignKeyName: "spec_values_spec_key_fkey"
            columns: ["spec_key"]
            isOneToOne: false
            referencedRelation: "spec_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      staff_members: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_site_client: {
        Args: { p_domain?: string; p_slug?: string }
        Returns: {
          domain: string
          email: string
          id: string
          legal_name: string
          logo_path: string
          name: string
          phone: string
          postal_address: string
          slug: string
          whatsapp: string
        }[]
      }
      register_interest: { Args: { p_client_id: string }; Returns: undefined }
    }
    Enums: {
      booking_purpose:
        | "first_look"
        | "technical_inspection"
        | "with_engineer_or_contractor"
        | "fit_out_quote"
      booking_status:
        | "requested"
        | "confirmed"
        | "visited"
        | "cancelled"
        | "no_show"
      correction_status: "open" | "accepted" | "declined"
      day_part: "morning" | "afternoon"
      deal_type: "lease" | "sale"
      document_visibility: "public" | "signed_in" | "staff"
      event_type:
        | "dossier_view"
        | "tour_open"
        | "spec_sheet_download"
        | "fit_check"
        | "fact_source_open"
        | "sign_up"
      fit_verdict:
        | "fits"
        | "fits_with_changes"
        | "does_not_fit"
        | "not_enough_data"
      lead_stage: "new" | "visit_booked" | "visited" | "offer" | "won" | "lost"
      listing_status: "draft" | "active" | "paused" | "closed"
      media_kind: "tour" | "photo" | "scan"
      property_status:
        | "draft"
        | "in_review"
        | "live"
        | "paused"
        | "sold_or_leased"
      provenance_label:
        | "measured"
        | "from_drawings"
        | "declared"
        | "indicative"
        | "not_found"
        | "not_yet_checked"
      requirement_rule: "minimum" | "maximum" | "must_have"
      space_kind: "hall" | "mezzanine" | "yard" | "office" | "other"
      spec_value_type: "number" | "boolean" | "text"
      staff_role: "lb_admin" | "lb_editor" | "lb_reviewer" | "client_staff"
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
      booking_purpose: [
        "first_look",
        "technical_inspection",
        "with_engineer_or_contractor",
        "fit_out_quote",
      ],
      booking_status: [
        "requested",
        "confirmed",
        "visited",
        "cancelled",
        "no_show",
      ],
      correction_status: ["open", "accepted", "declined"],
      day_part: ["morning", "afternoon"],
      deal_type: ["lease", "sale"],
      document_visibility: ["public", "signed_in", "staff"],
      event_type: [
        "dossier_view",
        "tour_open",
        "spec_sheet_download",
        "fit_check",
        "fact_source_open",
        "sign_up",
      ],
      fit_verdict: [
        "fits",
        "fits_with_changes",
        "does_not_fit",
        "not_enough_data",
      ],
      lead_stage: ["new", "visit_booked", "visited", "offer", "won", "lost"],
      listing_status: ["draft", "active", "paused", "closed"],
      media_kind: ["tour", "photo", "scan"],
      property_status: [
        "draft",
        "in_review",
        "live",
        "paused",
        "sold_or_leased",
      ],
      provenance_label: [
        "measured",
        "from_drawings",
        "declared",
        "indicative",
        "not_found",
        "not_yet_checked",
      ],
      requirement_rule: ["minimum", "maximum", "must_have"],
      space_kind: ["hall", "mezzanine", "yard", "office", "other"],
      spec_value_type: ["number", "boolean", "text"],
      staff_role: ["lb_admin", "lb_editor", "lb_reviewer", "client_staff"],
    },
  },
} as const
