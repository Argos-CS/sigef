import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarMoeda } from '@/utils/formatters';
import { ContaTipo } from '@/types/movimentacao';

interface DemonstrativoData {
  conta: ContaTipo;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}

interface DemonstrativoTableProps {
  data: DemonstrativoData[];
  categoriasSaida: Record<string, number>;
}

export const DemonstrativoTable: React.FC<DemonstrativoTableProps> = ({
  data,
  categoriasSaida
}) => {
  const totais = data.reduce((acc, curr) => ({
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

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead className="text-right">Saldo Inicial</TableHead>
            <TableHead className="text-right">Entradas</TableHead>
            <TableHead className="text-right">Saídas</TableHead>
            <TableHead className="text-right">Saldo Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.conta}>
              <TableCell className="font-medium">{row.conta}</TableCell>
              <TableCell className="text-right">{formatarMoeda(row.saldoInicial)}</TableCell>
              <TableCell className="text-right text-green-600">{formatarMoeda(row.entradas)}</TableCell>
              <TableCell className="text-right text-red-600">{formatarMoeda(row.saidas)}</TableCell>
              <TableCell className="text-right font-bold">{formatarMoeda(row.saldoFinal)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-muted/50">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-right">{formatarMoeda(totais.saldoInicial)}</TableCell>
            <TableCell className="text-right text-green-600">{formatarMoeda(totais.entradas)}</TableCell>
            <TableCell className="text-right text-red-600">{formatarMoeda(totais.saidas)}</TableCell>
            <TableCell className="text-right">{formatarMoeda(totais.saldoFinal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Detalhamento de Saídas por Categoria</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">% do Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(categoriasSaida).map(([categoria, valor]) => (
              <TableRow key={categoria}>
                <TableCell>{categoria}</TableCell>
                <TableCell className="text-right text-red-600">{formatarMoeda(valor)}</TableCell>
                <TableCell className="text-right">
                  {((valor / totais.saidas) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

src/components/relatorios/DemonstrativoContabil/DemonstrativoContabil.tsx

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

Now, let's update the Relatorios page to include our new component:
src/pages/Relatorios.tsx

import React, { useState, useMemo } from 'react';
import { useMovimentacoes, Movimentacao, ContaTipo } from '@/hooks/useMovimentacoes';
import MovimentacoesTable from '@/components/MovimentacoesTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatarMoeda } from '@/utils/formatters';
import ResumoFinanceiro from '@/components/relatorios/ResumoFinanceiro';
import FiltrosRelatorios from '@/components/relatorios/FiltrosRelatorios';
import GraficosRelatorios from '@/components/relatorios/GraficosRelatorios';
import { DemonstrativoContabil } from '@/components/relatorios/DemonstrativoContabil/DemonstrativoContabil';
import { useAuth } from '@/contexts/AuthContext';

const Relatorios = () => {
  const { user } = useAuth();
  const { movimentacoes, updateMovimentacao, deleteMovimentacao } = useMovimentacoes();
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    mes: '',
    ano: '',
    tipo: 'todos' as 'todos' | 'entrada' | 'saida',
    conta: 'todas' as ContaTipo | 'todas',
    descricao: '',
    ativo: false
  });

  const movimentacoesFiltradas = useMemo(() => {
    // ... keep existing code (filtering logic)
  }, [movimentacoes, filtros]);

  const dashboardData = useMemo(() => {
    // ... keep existing code (dashboard data calculations)
  }, [movimentacoesFiltradas]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      
      <Tabs defaultValue="demonstrativo">
        <TabsList>
          <TabsTrigger value="demonstrativo">Demonstrativo Contábil</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="todas">Todas as Movimentações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demonstrativo">
          <DemonstrativoContabil movimentacoes={movimentacoes} />
        </TabsContent>

        <TabsContent value="resumo">
          <ResumoFinanceiro dashboardData={dashboardData} />
        </TabsContent>
        
        <TabsContent value="graficos">
          <GraficosRelatorios dashboardData={dashboardData} />
        </TabsContent>

        <TabsContent value="todas">
          <FiltrosRelatorios filtros={filtros} setFiltros={setFiltros} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {Object.entries(dashboardData.totalPorConta).map(([conta, { entradas, saidas }]) => (
              <Card key={conta}>
                <CardHeader>
                  <CardTitle>{conta}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Entradas: {formatarMoeda(entradas)}</p>
                  <p>Saídas: {formatarMoeda(saidas)}</p>
                  <p className={`font-bold ${entradas - saidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Saldo: {formatarMoeda(entradas - saidas)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${dashboardData.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatarMoeda(dashboardData.saldo)}
              </p>
            </CardContent>
          </Card>

          <MovimentacoesTable 
            movimentacoes={movimentacoesFiltradas}
            onEdit={updateMovimentacao}
            onDelete={deleteMovimentacao}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
