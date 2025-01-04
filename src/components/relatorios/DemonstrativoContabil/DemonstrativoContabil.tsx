import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/components/ui/use-toast';
import { ContaTipo, Movimentacao } from '@/types/movimentacao';
import { formatarMoeda } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';
import { BalanceteTable } from './BalanceteTable';
import { SaidasPorCategoriaTable } from './SaidasPorCategoriaTable';
import { DetalhamentoSaidasTable } from './DetalhamentoSaidasTable';

interface DemonstrativoContabilProps {
  movimentacoes: Movimentacao[];
}

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  nivel: string;
  tipo: string;
}

const CONTAS_MAPPING: Record<ContaTipo, string> = {
  'Bradesco': '1.1 Bradesco',
  'Cora': '1.2 Cora',
  'Dinheiro': '1.3 Dinheiro'
};

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

  const months = useMemo(() => {
    const uniqueMonths = new Set(
      movimentacoes.map(m => format(new Date(m.data), 'yyyy-MM'))
    );
    return Array.from(uniqueMonths).sort().reverse();
  }, [movimentacoes]);

  const demonstrativoData = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const contas: ContaTipo[] = ['Bradesco', 'Cora', 'Dinheiro'];
    const categoriasSaida: Record<string, number> = {};

    categoriasSecundarias.forEach(cat => {
      categoriasSaida[`${cat.codigo} - ${cat.nome}`] = 0;
    });

    const movimentacoesFiltradas = movimentacoes.filter(m => {
      const data = new Date(m.data);
      return data >= startDate && data <= endDate;
    });

    const demonstrativo = contas.map(conta => {
      const movimentacoesConta = movimentacoesFiltradas.filter(m => m.conta === conta);
      
      const entradas = movimentacoesConta
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + Number(m.valor), 0);
      
      const saidas = movimentacoesConta
        .filter(m => m.tipo === 'saida')
        .reduce((sum, m) => sum + Number(m.valor), 0);

      const movimentacoesAnteriores = movimentacoes.filter(m => {
        const data = new Date(m.data);
        return data < startDate && m.conta === conta;
      });

      const saldoInicial = movimentacoesAnteriores.reduce((sum, m) => {
        return sum + (m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor));
      }, 0);

      return {
        conta: CONTAS_MAPPING[conta],
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
          const categoriaKey = `${categoria.codigo} - ${categoria.nome}`;
          categoriasSaida[categoriaKey] = (categoriasSaida[categoriaKey] || 0) + Number(m.valor);
        }
      });

    return { 
      demonstrativo, 
      categoriasSaida,
      movimentacoesFiltradas
    };
  }, [movimentacoes, selectedMonth, categoriasSecundarias]);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const monthYear = format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR });
      
      doc.text(`1. Balancete - ${monthYear}`, 14, 15);
      
      // Main table
      const tableData = demonstrativoData.demonstrativo.map(row => [
        row.conta,
        formatarMoeda(row.saldoInicial),
        formatarMoeda(row.entradas),
        formatarMoeda(row.saidas),
        formatarMoeda(row.saldoFinal),
      ]);

      // Calculate totals
      const totals = demonstrativoData.demonstrativo.reduce((acc, curr) => ({
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

      // Add totals row
      tableData.push([
        'TOTAL',
        formatarMoeda(totals.saldoInicial),
        formatarMoeda(totals.entradas),
        formatarMoeda(totals.saidas),
        formatarMoeda(totals.saldoFinal),
      ]);

      doc.autoTable({
        head: [['Conta', 'Saldo Inicial', 'Entradas', 'Saídas', 'Saldo Final']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [70, 70, 70] },
      });

      // Categories table
      const startY = doc.lastAutoTable.finalY + 15;
      doc.text('2. Saídas por Categoria', 14, startY);
      
      const categoriasData = Object.entries(demonstrativoData.categoriasSaida)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([categoria, valor]) => [
          categoria,
          formatarMoeda(valor),
          `${((valor / totals.saidas) * 100).toFixed(2)}%`,
        ]);

      doc.autoTable({
        head: [['Categoria', 'Valor', '% do Total']],
        body: categoriasData,
        startY: startY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [70, 70, 70] },
      });

      // Detailed expenses table
      const detailStartY = doc.lastAutoTable.finalY + 15;
      doc.text('3. Detalhamento de Saídas', 14, detailStartY);

      const detailData = demonstrativoData.movimentacoesFiltradas
        .filter(mov => mov.tipo === 'saida')
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map((mov, index) => {
          const categoria = categoriasSecundarias.find(c => c.id === mov.categoria_id);
          return [
            (index + 1).toString(),
            new Date(mov.data).toLocaleDateString(),
            CONTAS_MAPPING[mov.conta as ContaTipo],
            categoria ? `${categoria.codigo} - ${categoria.nome}` : '',
            mov.descricao,
            formatarMoeda(Number(mov.valor)),
          ];
        });

      doc.autoTable({
        head: [['ID', 'Data', 'Conta', 'Categoria', 'Descrição', 'Valor']],
        body: detailData,
        startY: detailStartY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [70, 70, 70] },
      });

      doc.save(`balancete-${selectedMonth}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: `O balancete foi salvo como balancete-${selectedMonth}.pdf`,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
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
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <BalanceteTable data={demonstrativoData.demonstrativo} />

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Saídas por Categoria</h2>
            <SaidasPorCategoriaTable 
              categoriasSaida={demonstrativoData.categoriasSaida}
              totalSaidas={demonstrativoData.demonstrativo.reduce((sum, row) => sum + row.saidas, 0)}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Detalhamento de Saídas</h2>
            <DetalhamentoSaidasTable 
              movimentacoes={demonstrativoData.movimentacoesFiltradas}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};