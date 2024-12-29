export interface Movimentacao {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  conta: string;
  descricao: string;
  valor: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  categoria_id?: string;
}