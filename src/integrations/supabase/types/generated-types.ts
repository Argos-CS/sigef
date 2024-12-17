export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string;
          user_id: string | null;
          message: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          message: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          message?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      movimentacoes: {
        Row: {
          id: string;
          data: string;
          tipo: string;
          conta: 'Dinheiro' | 'Bradesco' | 'Cora';
          descricao: string;
          valor: number;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_approved: boolean | null;
        };
        Insert: {
          id?: string;
          data?: string;
          tipo: string;
          conta: 'Dinheiro' | 'Bradesco' | 'Cora';
          descricao: string;
          valor: number;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_approved?: boolean | null;
        };
        Update: {
          id?: string;
          data?: string;
          tipo?: string;
          conta?: 'Dinheiro' | 'Bradesco' | 'Cora';
          descricao?: string;
          valor?: number;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_approved?: boolean | null;
        };
      };
      // ... outros tipos de tabelas
    };
    Views: Record<string, never>;
    Functions: {
      maintenance_vacuum_analyze: {
        Args: {
          table_name: string;
        };
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
          new_status: 'ativo' | 'desativado';
        };
        Returns: void;
      };
    };
    Enums: {
      conta_tipo: 'Dinheiro' | 'Bradesco' | 'Cora';
      user_role: 'admin' | 'tesoureiro' | 'assistente' | 'auditor';
    };
  };
}