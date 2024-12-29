import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Movimentacao, MovimentacaoTipo } from '@/types/movimentacao';

export const useMovimentacoesQueries = () => {
  const { toast } = useToast();

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
        valor: item.valor.toString(),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      })) || [];

      console.log('Movimentações carregadas:', typedData);
      return typedData;
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      toast({
        title: "Erro ao carregar movimentações",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    fetchMovimentacoes,
  };
};