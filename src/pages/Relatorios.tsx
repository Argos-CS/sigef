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
