import { useEffect } from 'react';
import { useMovimentacoesState } from './useMovimentacoesState';
import { useMovimentacoesQueries } from './useMovimentacoesQueries';
import { useMovimentacoesMutations } from './useMovimentacoesMutations';
import { useAuth } from '@/contexts/AuthContext';
import { Movimentacao, MovimentacaoTipo, ContaTipo } from '@/types/movimentacao';

export type { Movimentacao, MovimentacaoTipo, ContaTipo };

export const useMovimentacoes = () => {
  const { user } = useAuth();
  const { movimentacoes, setMovimentacoes } = useMovimentacoesState();
  const { fetchMovimentacoes } = useMovimentacoesQueries();
  const { addMovimentacao, updateMovimentacao, deleteMovimentacao } = useMovimentacoesMutations();

  useEffect(() => {
    if (user) {
      fetchMovimentacoes().then(setMovimentacoes);
    }
  }, [user]);

  return {
    movimentacoes,
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
  };
};