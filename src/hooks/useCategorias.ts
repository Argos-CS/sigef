import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { MovimentacaoTipo } from './useMovimentacoes';

export interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  nivel: string;
  tipo: MovimentacaoTipo;
  categoria_pai_id: string | null;
}

export const useCategorias = (tipoSelecionado: MovimentacaoTipo) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        console.log('Buscando categorias do plano de contas...');
        const { data, error } = await supabase
          .from('categorias_plano_contas')
          .select('*')
          .order('codigo');
        
        if (error) {
          console.error('Erro ao carregar categorias:', error);
          toast({
            title: "Erro ao carregar categorias",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        const typedData = data?.map(cat => ({
          ...cat,
          tipo: cat.tipo as MovimentacaoTipo
        })) || [];
        
        console.log('Categorias carregadas:', typedData);
        setCategorias(typedData);
      } catch (error: any) {
        console.error('Erro ao buscar categorias:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Ocorreu um erro ao carregar as categorias",
          variant: "destructive",
        });
      }
    };

    fetchCategorias();
  }, [toast]);

  const categoriasFiltradas = categorias.filter(cat => 
    cat.tipo === tipoSelecionado && cat.nivel !== 'principal'
  );

  const formatarCategoria = (categoria: Categoria) => {
    return `${categoria.codigo} - ${categoria.nome}`;
  };

  return {
    categoriasFiltradas,
    formatarCategoria
  };
};