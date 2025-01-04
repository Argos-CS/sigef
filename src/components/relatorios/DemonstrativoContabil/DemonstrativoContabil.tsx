import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { DemonstrativoTable } from './DemonstrativoTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/components/ui/use-toast';
import { ContaTipo, Movimentacao } from '@/types/movimentacao';

interface DemonstrativoContabilProps {
  movimentacoes: Movimentacao[];
}

export const DemonstrativoContabil: React.FC<DemonstrativoContabilProps> = ({ movimentacoes }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const { toast } = useToast();

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

      // Calcular saldo inicial baseado em movimentações anteriores
      const movimentacoesAnteriores = movimentacoes.filter(m => {
        const data = new Date(m.data);
        return data < startDate && m.conta === conta;
      });

      const saldoInicial = movimentacoesAnteriores.reduce((sum, m) => {
        return sum + (m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor));
      }, 0);

      return {
        conta,
        saldoInicial,
        entradas,
        saidas,
        saldoFinal: saldoInicial + entradas - saidas,
      };
    });

    // Calcular totais por categoria para saídas
    movimentacoesFiltradas
      .filter(m => m.tipo === 'saida')
      .forEach(m => {
        const categoria = m.categoria?.nome || 'Sem Categoria';
        categoriasSaida[categoria] = (categoriasSaida[categoria] || 0) + Number(m.valor);
      });

    return { demonstrativo, categoriasSaida };
  }, [movimentacoes, selectedMonth]);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const monthYear = format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR });
      
      doc.text(`Demonstrativo Contábil - ${monthYear}`, 14, 15);
      
      // Tabela principal
      const tableData = demonstrativoData.demonstrativo.map(row => [
        row.conta,
        formatarMoeda(row.saldoInicial),
        formatarMoeda(row.entradas),
        formatarMoeda(row.saidas),
        formatarMoeda(row.saldoFinal),
      ]);

      doc.autoTable({
        head: [['Conta', 'Saldo Inicial', 'Entradas', 'Saídas', 'Saldo Final']],
        body: tableData,
        startY: 25,
      });

      // Tabela de categorias
      doc.text('Detalhamento de Saídas por Categoria', 14, doc.autoTable.previous.finalY + 15);
      
      const categoriasData = Object.entries(demonstrativoData.categoriasSaida).map(([categoria, valor]) => [
        categoria,
        formatarMoeda(valor),
      ]);

      doc.autoTable({
        head: [['Categoria', 'Valor']],
        body: categoriasData,
        startY: doc.autoTable.previous.finalY + 20,
      });

      doc.save(`demonstrativo-contabil-${selectedMonth}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: `O demonstrativo foi salvo como demonstrativo-contabil-${selectedMonth}.pdf`,
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Demonstrativo Contábil</CardTitle>
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
      <CardContent>
        <DemonstrativoTable 
          data={demonstrativoData.demonstrativo}
          categoriasSaida={demonstrativoData.categoriasSaida}
        />
      </CardContent>
    </Card>
  );
};
