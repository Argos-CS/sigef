import { Json } from './json';

export interface Database {
  public: {
    Tables: {
      auth_config: {
        Row: {
          id: string;
          settings: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          settings?: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          settings?: Json;
          updated_at?: string | null;
        };
      };
      categorias_plano_contas: {
        Row: {
          categoria_pai_id: string | null;
          codigo: string;
          created_at: string | null;
          id: string;
          nivel: Database["public"]["Enums"]["categoria_nivel"];
          nome: string;
          tipo: string;
          updated_at: string | null;
        };
        Insert: {
          categoria_pai_id?: string | null;
          codigo: string;
          created_at?: string | null;
          id?: string;
          nivel: Database["public"]["Enums"]["categoria_nivel"];
          nome: string;
          tipo: string;
          updated_at?: string | null;
        };
        Update: {
          categoria_pai_id?: string | null;
          codigo?: string;
          created_at?: string | null;
          id?: string;
          nivel?: Database["public"]["Enums"]["categoria_nivel"];
          nome?: string;
          tipo?: string;
          updated_at?: string | null;
        };
      }
      chat_messages: {
        Row: {
          created_at: string | null;
          id: string;
          message: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
      };
      movimentacao_comments: {
        Row: {
          created_at: string | null;
          id: string;
          message: string;
          movimentacao_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message: string;
          movimentacao_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string;
          movimentacao_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
      };
      movimentacoes: {
        Row: {
          categoria_id: string | null;
          conta: Database["public"]["Enums"]["conta_tipo"];
          created_at: string | null;
          created_by: string | null;
          data: string;
          descricao: string;
          id: string;
          is_approved: boolean;
          tipo: string;
          updated_at: string | null;
          valor: number;
        };
        Insert: {
          categoria_id?: string | null;
          conta: Database["public"]["Enums"]["conta_tipo"];
          created_at?: string | null;
          created_by?: string | null;
          data?: string;
          descricao: string;
          id?: string;
          is_approved?: boolean;
          tipo: string;
          updated_at?: string | null;
          valor: number;
        };
        Update: {
          categoria_id?: string | null;
          conta?: Database["public"]["Enums"]["conta_tipo"];
          created_at?: string | null;
          created_by?: string | null;
          data?: string;
          descricao?: string;
          id?: string;
          is_approved?: boolean;
          tipo?: string;
          updated_at?: string | null;
          valor?: number;
        };
      };
      movimentacoes_import_log: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          filename: string;
          id: string;
          status: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          filename: string;
          id?: string;
          status: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          filename?: string;
          id?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          nome: string;
          papel: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id: string;
          nome: string;
          papel?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          nome?: string;
          papel?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string | null;
        };
      };
      secrets: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
      };
      system_logs: {
        Row: {
          action_type: string;
          created_at: string | null;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          record_id: string;
          table_name: string;
          user_id: string | null;
        };
        Insert: {
          action_type: string;
          created_at?: string | null;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id: string;
          table_name: string;
          user_id?: string | null;
        };
        Update: {
          action_type?: string;
          created_at?: string | null;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string;
          table_name?: string;
          user_id?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      maintenance_vacuum_analyze: {
        Args: { table_name: string };
        Returns: void;
      };
      log_action: {
        Args: {
          user_id: string;
          action_type: string;
          table_name: string;
          record_id: string;
          old_data: Json;
          new_data: Json;
        };
        Returns: void;
      };
      toggle_user_status: {
        Args: {
          user_id_param: string;
          new_status: Database["public"]["Enums"]["user_status"];
        };
        Returns: void;
      };
    };
    Enums: {
      categoria_nivel: 'principal' | 'secundaria' | 'terciaria';
      conta_tipo: 'Dinheiro' | 'Bradesco' | 'Cora';
      user_role: 'admin' | 'tesoureiro' | 'assistente' | 'auditor';
      user_status: 'ativo' | 'desativado';
    };
    CompositeTypes: Record<string, never>;
  };
}
