export type ContaTipo = 'CAIXA' | 'BANCO' | 'POUPANCA' | 'INVESTIMENTOS';
export type MovimentacaoTipo = 'entrada' | 'saida';

export interface Movimentacao {
  id: string;
  data: string;
  tipo: MovimentacaoTipo;
  conta: ContaTipo;
  descricao: string;
  valor: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  categoria_id?: string;
}