import { ContaTipo, UserRole } from './enums';

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Movimentacao {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  conta: ContaTipo;
  descricao: string;
  valor: number;
  created_by?: string;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MovimentacaoAudit {
  id: string;
  movimentacao_id: string;
  auditor_id: string;
  status: 'aprovado' | 'reprovado' | 'pendente';
  comentario?: string;
  created_at?: string;
  updated_at?: string;
}