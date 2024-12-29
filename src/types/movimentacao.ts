export type ContaTipo = 'Dinheiro' | 'Bradesco' | 'Cora';
export type MovimentacaoTipo = 'entrada' | 'saida';

export interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  nivel: string;
  tipo: string;
}

export interface Movimentacao {
  id: string;
  data: string;
  tipo: MovimentacaoTipo;
  descricao: string;
  valor: string;
  conta: ContaTipo;
  created_by?: string;
  is_approved?: boolean;
  categoria_id?: string | null;
  categoria?: Categoria | null;
  created_at: string;
  updated_at: string;
}