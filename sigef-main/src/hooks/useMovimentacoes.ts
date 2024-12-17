import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export type ContaTipo = 'Dinheiro' | 'Bradesco' | 'Cora';
export type MovimentacaoTipo = 'entrada' | 'saida';

export interface Categoria {
  id: string;
  nome: string;
  codigo: string;
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
}

export const useMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMovimentacoes();
    }
  }, [user]);

  const fetchMovimentacoes = async () => {
    try {
      console.log('Buscando movimentações...');
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        throw error;
      }

      const typedData = data?.map(item => ({
        ...item,
        tipo: item.tipo as MovimentacaoTipo,
        valor: item.valor.toString()
      })) || [];

      console.log('Movimentações carregadas:', typedData);
      setMovimentacoes(typedData);
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      toast({
        title: "Erro ao carregar movimentações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMovimentacao = async (movimentacao: Omit<Movimentacao, 'id' | 'created_by' | 'is_approved'>) => {
    if (!user) {
      toast({
        title: "Erro ao registrar movimentação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adicionando nova movimentação:', movimentacao);
      const novaMovimentacao = {
        ...movimentacao,
        created_by: user.id,
        is_approved: false,
        valor: parseFloat(movimentacao.valor),
        categoria_id: movimentacao.categoria_id || null // Garante que categoria_id seja null se não fornecido
      };

      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([novaMovimentacao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar movimentação:', error);
        throw error;
      }

      const typedData = {
        ...data,
        tipo: data.tipo as MovimentacaoTipo,
        valor: data.valor.toString()
      };

      console.log('Movimentação registrada com sucesso:', typedData);
      setMovimentacoes(prev => [typedData, ...prev]);
      
      toast({
        title: "Movimentação registrada",
        description: "A movimentação foi salva com sucesso.",
      });

      return typedData;
    } catch (error: any) {
      console.error('Erro ao salvar movimentação:', error);
      toast({
        title: "Erro ao salvar movimentação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMovimentacao = async (id: string, updatedMovimentacao: Partial<Movimentacao>) => {
    try {
      console.log('Atualizando movimentação:', id, updatedMovimentacao);
      const { data: currentMovimentacao } = await supabase
        .from('movimentacoes')
        .select('is_approved')
        .eq('id', id)
        .single();

      if (currentMovimentacao?.is_approved) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível editar uma movimentação aprovada.",
          variant: "destructive",
        });
        return;
      }

      const updateData = {
        ...updatedMovimentacao,
        valor: updatedMovimentacao.valor ? parseFloat(updatedMovimentacao.valor) : undefined,
        categoria_id: updatedMovimentacao.categoria_id || null // Garante que categoria_id seja null se não fornecido
      };

      const { data, error } = await supabase
        .from('movimentacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar movimentação:', error);
        throw error;
      }

      const typedData = {
        ...data,
        tipo: data.tipo as MovimentacaoTipo,
        valor: data.valor.toString()
      };

      console.log('Movimentação atualizada com sucesso:', typedData);
      setMovimentacoes(prev => 
        prev.map(m => m.id === id ? { ...m, ...typedData } : m)
      );

      toast({
        title: "Movimentação atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      return typedData;
    } catch (error: any) {
      console.error('Erro ao atualizar movimentação:', error);
      toast({
        title: "Erro ao atualizar movimentação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMovimentacao = async (id: string) => {
    try {
      console.log('Deletando movimentação:', id);
      const { data: currentMovimentacao } = await supabase
        .from('movimentacoes')
        .select('is_approved')
        .eq('id', id)
        .single();

      if (currentMovimentacao?.is_approved) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível excluir uma movimentação aprovada.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('movimentacoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar movimentação:', error);
        throw error;
      }

      console.log('Movimentação deletada com sucesso:', id);
      setMovimentacoes(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Movimentação excluída",
        description: "A movimentação foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir movimentação:', error);
      toast({
        title: "Erro ao excluir movimentação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    movimentacoes,
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
  };
};