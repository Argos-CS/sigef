import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { formatarMoeda } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { TableActions } from './table/TableActions';
import { TableStatusCell } from './table/TableStatusCell';

interface MovimentacoesTableProps {
  movimentacoes: Movimentacao[];
  onEdit: (id: string, movimentacao: Movimentacao) => void;
  onDelete: (id: string) => void;
}

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
}

const MovimentacoesTable: React.FC<MovimentacoesTableProps> = ({ 
  movimentacoes, 
  onEdit, 
  onDelete 
}) => {
  const { user, canManageFinances } = useAuth();
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Record<string, Categoria>>({});

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias_plano_contas')
        .select('id, codigo, nome');
      
      if (error) {
        console.error('Erro ao carregar categorias:', error);
        return;
      }
      
      const categoriasMap = data.reduce((acc, cat) => ({
        ...acc,
        [cat.id]: cat
      }), {});
      
      setCategorias(categoriasMap);
    };

    fetchCategorias();
  }, []);

  const canEditMovimentacao = (movimentacao: Movimentacao) => {
    if (!user) return false;
    if (user.papel === 'admin') return false;
    if (user.papel === 'tesoureiro') {
      return !movimentacao.is_approved;
    }
    return false;
  };

  const canDeleteMovimentacao = (movimentacao: Movimentacao) => {
    return canManageFinances() && !movimentacao.is_approved;
  };

  const canViewComments = (movimentacao: Movimentacao) => {
    return user?.papel !== 'admin';
  };

  const formatarCategoria = (categoriaId: string) => {
    const categoria = categorias[categoriaId];
    return categoria ? categoria.nome : '';
  };

  const formatarValorComCor = (valor: string, tipo: string) => {
    const valorNumerico = Number(valor);
    const valorFormatado = formatarMoeda(Math.abs(valorNumerico));
    const isSaida = tipo === 'saida';
    return (
      <span className={cn(
        "font-medium",
        isSaida ? "text-red-600" : "text-blue-600"
      )}>
        {isSaida ? `- ${valorFormatado}` : valorFormatado}
      </span>
    );
  };

  const sortedMovimentacoes = [...movimentacoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">Data</TableHead>
            <TableHead className="w-[40%]">Descrição</TableHead>
            <TableHead className="w-[120px]">Categoria</TableHead>
            <TableHead className="w-[100px]">Valor</TableHead>
            <TableHead className="w-[100px]">Conta</TableHead>
            <TableHead className="w-[60px] text-center">Status</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovimentacoes.map((movimentacao) => (
            <TableRow key={movimentacao.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="max-w-[40%]">
                <div className="line-clamp-2">{movimentacao.descricao}</div>
              </TableCell>
              <TableCell className="max-w-[120px]">
                <div className="line-clamp-2">{formatarCategoria(movimentacao.categoria_id)}</div>
              </TableCell>
              <TableCell>{formatarValorComCor(movimentacao.valor, movimentacao.tipo)}</TableCell>
              <TableCell className="max-w-[100px]">
                <div className="line-clamp-1">{movimentacao.conta}</div>
              </TableCell>
              <TableCell className="text-center">
                <TableStatusCell isApproved={movimentacao.is_approved} />
              </TableCell>
              <TableCell>
                <TableActions
                  movimentacao={movimentacao}
                  canEdit={canEditMovimentacao(movimentacao)}
                  canDelete={canDeleteMovimentacao(movimentacao)}
                  canViewComments={canViewComments(movimentacao)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  selectedMovimentacao={selectedMovimentacao}
                  setSelectedMovimentacao={setSelectedMovimentacao}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MovimentacoesTable;