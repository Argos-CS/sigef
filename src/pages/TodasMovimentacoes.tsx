import React, { useState, useMemo } from 'react';
import { useMovimentacoes, Movimentacao, ContaTipo } from '@/hooks/useMovimentacoes';
import MovimentacoesTable from '@/components/MovimentacoesTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import FiltrosMovimentacoes from '@/components/financas/FiltrosMovimentacoes';
import { ImportExportTools } from '@/components/financas/ImportExportTools';
import { formatarMoeda } from '@/utils/formatters';

const TodasMovimentacoes: React.FC = () => {
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
  });
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  const aplicarFiltros = () => setFiltroAtivo(true);
  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      mes: '',
      ano: '',
      tipo: 'todos',
      conta: 'todas',
      descricao: '',
    });
    setFiltroAtivo(false);
  };

  const movimentacoesFiltradas = useMemo(() => {
    if (!filtroAtivo) return movimentacoes;

    return movimentacoes
      .filter(m => filtros.dataInicio ? new Date(m.data) >= new Date(filtros.dataInicio) : true)
      .filter(m => filtros.dataFim ? new Date(m.data) <= new Date(filtros.dataFim) : true)
      .filter(m => filtros.mes ? new Date(m.data).getMonth() + 1 === parseInt(filtros.mes) : true)
      .filter(m => filtros.ano ? new Date(m.data).getFullYear() === parseInt(filtros.ano) : true)
      .filter(m => filtros.tipo !== 'todos' ? m.tipo === filtros.tipo : true)
      .filter(m => filtros.conta !== 'todas' ? m.conta === filtros.conta : true)
      .filter(m => filtros.descricao ? m.descricao.toLowerCase().includes(filtros.descricao.toLowerCase()) : true)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [movimentacoes, filtroAtivo, filtros]);

  const dashboardData = useMemo(() => {
    const totalPorConta = {
      Dinheiro: { entradas: 0, saidas: 0 },
      Bradesco: { entradas: 0, saidas: 0 },
      Cora: { entradas: 0, saidas: 0 },
    };

    movimentacoesFiltradas.forEach(m => {
      if (m.tipo === 'entrada') {
        totalPorConta[m.conta].entradas += Number(m.valor);
      } else {
        totalPorConta[m.conta].saidas += Number(m.valor);
      }
    });

    const totalEntradas = Object.values(totalPorConta).reduce((sum, { entradas }) => sum + entradas, 0);
    const totalSaidas = Object.values(totalPorConta).reduce((sum, { saidas }) => sum + saidas, 0);
    const saldo = totalEntradas - totalSaidas;

    const movimentacoesPorMes = movimentacoesFiltradas.reduce((acc, m) => {
      const date = new Date(m.data);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthYear]) {
        acc[monthYear] = { Dinheiro: 0, Bradesco: 0, Cora: 0 };
      }
      acc[monthYear][m.conta] += Number(m.valor) * (m.tipo === 'entrada' ? 1 : -1);
      return acc;
    }, {} as Record<string, Record<ContaTipo, number>>);

    const chartData = Object.entries(movimentacoesPorMes).map(([monthYear, data]) => ({
      name: monthYear,
      Dinheiro: data.Dinheiro,
      Bradesco: data.Bradesco,
      Cora: data.Cora,
    }));

    return { totalPorConta, totalEntradas, totalSaidas, saldo, chartData };
  }, [movimentacoesFiltradas]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  const handleImportSuccess = () => {
    // Refresh the data after successful import
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Todas as Movimentações</h1>
        <ImportExportTools onImportSuccess={handleImportSuccess} />
      </div>
      
      <FiltrosMovimentacoes
        filtros={filtros}
        setFiltros={setFiltros}
        aplicarFiltros={aplicarFiltros}
        limparFiltros={limparFiltros}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Saldo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${dashboardData.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatarMoeda(dashboardData.saldo)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Bar dataKey="Dinheiro" fill="#4ade80" name="Dinheiro" />
              <Bar dataKey="Bradesco" fill="#f87171" name="Bradesco" />
              <Bar dataKey="Cora" fill="#60a5fa" name="Cora" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <MovimentacoesTable 
        movimentacoes={movimentacoesFiltradas}
        onEdit={updateMovimentacao}
        onDelete={deleteMovimentacao}
      />
    </div>
  );
};

export default TodasMovimentacoes;
