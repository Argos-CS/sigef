import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Movimentacao, MovimentacaoTipo } from '@/types/movimentacao';
import { useAuth } from '@/contexts/AuthContext';

export const useMovimentacoesMutations = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const addMovimentacao = async (movimentacao: Omit<Movimentacao, 'id' | 'created_by' | 'is_approved' | 'created_at' | 'updated_at'>) => {
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
        categoria_id: movimentacao.categoria_id || null
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

      const typedData: Movimentacao = {
        ...data,
        tipo: data.tipo as MovimentacaoTipo,
        valor: data.valor.toString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      console.log('Movimentação registrada com sucesso:', typedData);
      
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
        categoria_id: updatedMovimentacao.categoria_id || null
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
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
  };
};