export interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  nivel: string;
  tipo: string;
}

export interface BalanceteData {
  conta: string;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}