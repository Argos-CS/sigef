import { useState } from 'react';
import { Movimentacao } from '@/types/movimentacao';

export const useMovimentacoesState = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  
  return {
    movimentacoes,
    setMovimentacoes,
  };
};