import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Movimentacao } from '@/types/movimentacao';
import { supabase } from '@/lib/supabase';
import { BalanceteTable } from './BalanceteTable';
import { SaidasPorCategoriaTable } from './SaidasPorCategoriaTable';
import { DetalhamentoSaidasTable } from './DetalhamentoSaidasTable';
import { exportToPDF } from './PDFExport';
import { Categoria } from './types';

interface DemonstrativoContabilProps {
  movimentacoes: Movimentacao[];
}

export const DemonstrativoContabil: React.FC<DemonstrativoContabilProps> = ({ movimentacoes }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [categoriasSecundarias, setCategoriasSecundarias] = useState<Categoria[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias_plano_contas')
        .select('*')
        .eq('nivel', 'secundaria')
        .eq('tipo', 'saida')
        .order('codigo');
      
      if (error) {
        console.error('Erro ao carregar categorias:', error);
        return;
      }
      
      setCategoriasSecundarias(data);
    };

    fetchCategorias();
  }, []);

  const months = React.useMemo(() => {
    const uniqueMonths = new Set(
      movimentacoes.map(m => format(new Date(m.data), 'yyyy-MM'))
    );
    return Array.from(uniqueMonths).sort().reverse();
  }, [movimentacoes]);

  const demonstrativoData = React.useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const movimentacoesFiltradas = movimentacoes.filter(m => {
      const data = new Date(m.data);
      return data >= startDate && data <= endDate;
    });

    const categoriasSaida: Record<string, number> = {};
    categoriasSecundarias.forEach(cat => {
      categoriasSaida[cat.nome] = 0;
    });

    const demonstrativo = [
      { conta: 'Bradesco', saldoInicial: 0, entradas: 0, saidas: 0, saldoFinal: 0 },
      { conta: 'Cora', saldoInicial: 0, entradas: 0, saidas: 0, saldoFinal: 0 },
      { conta: 'Dinheiro', saldoInicial: 0, entradas: 0, saidas: 0, saldoFinal: 0 }
    ].map(conta => {
      const movimentacoesConta = movimentacoesFiltradas.filter(
        m => m.conta === conta.conta
      );
      
      const entradas = movimentacoesConta
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + Number(m.valor), 0);
      
      const saidas = movimentacoesConta
        .filter(m => m.tipo === 'saida')
        .reduce((sum, m) => sum + Number(m.valor), 0);

      const movimentacoesAnteriores = movimentacoes.filter(m => {
        const data = new Date(m.data);
        return data < startDate && m.conta === conta.conta;
      });

      const saldoInicial = movimentacoesAnteriores.reduce((sum, m) => {
        return sum + (m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor));
      }, 0);

      return {
        ...conta,
        saldoInicial,
        entradas,
        saidas,
        saldoFinal: saldoInicial + entradas - saidas,
      };
    });

    movimentacoesFiltradas
      .filter(m => m.tipo === 'saida')
      .forEach(m => {
        const categoria = categoriasSecundarias.find(c => c.id === m.categoria_id);
        if (categoria) {
          categoriasSaida[categoria.nome] = (categoriasSaida[categoria.nome] || 0) + Number(m.valor);
        }
      });

    const totals = demonstrativo.reduce((acc, curr) => ({
      saldoInicial: acc.saldoInicial + curr.saldoInicial,
      entradas: acc.entradas + curr.entradas,
      saidas: acc.saidas + curr.saidas,
      saldoFinal: acc.saldoFinal + curr.saldoFinal,
    }), {
      saldoInicial: 0,
      entradas: 0,
      saidas: 0,
      saldoFinal: 0,
    });

    return { 
      demonstrativo,
      categoriasSaida,
      movimentacoesFiltradas,
      totals
    };
  }, [movimentacoes, selectedMonth, categoriasSecundarias]);

  const handleExportPDF = () => {
    const monthYear = format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR });
    const success = exportToPDF({
      demonstrativo: demonstrativoData.demonstrativo,
      categoriasSaida: demonstrativoData.categoriasSaida,
      movimentacoesFiltradas: demonstrativoData.movimentacoesFiltradas,
      categoriasSecundarias,
      monthYear,
      totals: demonstrativoData.totals
    });

    if (success) {
      toast({
        title: "PDF exportado com sucesso",
        description: `O balancete foi salvo como balancete-${selectedMonth}.pdf`,
      });
    } else {
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>1. Balancete</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + '-01'), 'MMMM yyyy', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <BalanceteTable 
            data={demonstrativoData.demonstrativo} 
            totals={demonstrativoData.totals}
          />

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Saídas por Categoria</h2>
            <SaidasPorCategoriaTable 
              categoriasSaida={demonstrativoData.categoriasSaida}
              totalSaidas={demonstrativoData.totals.saidas}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Detalhamento dos Registros Financeiros</h2>
            <DetalhamentoSaidasTable 
              movimentacoes={demonstrativoData.movimentacoesFiltradas}
              categoriasSecundarias={categoriasSecundarias}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
