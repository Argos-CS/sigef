import React, { useState, useMemo } from 'react';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import TrendChart from '@/components/dashboard/TrendChart';
import { ExpenseAnalysisChart } from '@/components/dashboard/ExpenseAnalysisChart';
import { ChartBar, ChartLine, Filter, Calendar } from 'lucide-react';
import BalanceCards from '@/components/dashboard/BalanceCards';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SaldoPorContaPie } from '@/components/dashboard/SaldoPorContaPie';

const Dashboard = () => {
  const { movimentacoes } = useMovimentacoes();
  const [timeRange, setTimeRange] = useState('30');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [conta, setConta] = useState('todas');
  const [tipo, setTipo] = useState('todos');

  const resetFilters = () => {
    setTimeRange('30');
    setDateRange({ from: undefined, to: undefined });
    setConta('todas');
    setTipo('todos');
  };

  const filteredData = useMemo(() => {
    try {
      const hoje = new Date();
      let dataInicial = new Date();

      if (timeRange === 'custom' && dateRange.from && dateRange.to) {
        dataInicial = new Date(dateRange.from);
        hoje.setTime(new Date(dateRange.to).getTime());
        hoje.setHours(23, 59, 59, 999);
      } else {
        dataInicial.setDate(hoje.getDate() - Number(timeRange));
      }

      return movimentacoes.filter(m => {
        const movData = new Date(m.data);
        const passaFiltroData = movData >= dataInicial && movData <= hoje;
        const passaFiltroConta = conta === 'todas' || m.conta === conta;
        const passaFiltroTipo = tipo === 'todos' || m.tipo === tipo;

        return passaFiltroData && passaFiltroConta && passaFiltroTipo;
      });
    } catch (error) {
      console.error('Erro ao filtrar dados:', error);
      return [];
    }
  }, [movimentacoes, timeRange, dateRange, conta, tipo]);

  const {
    saldosPorConta,
    dadosUltimos12Meses
  } = useMemo(() => {
    try {
      // Calcula as datas inicial e final com base no filtro
      const hoje = new Date();
      let dataInicial: Date;
      let dataFinal: Date;

      if (timeRange === 'custom' && dateRange.from && dateRange.to) {
        dataInicial = new Date(dateRange.from);
        dataFinal = new Date(dateRange.to);
      } else {
        dataFinal = hoje;
        dataInicial = new Date(hoje);
        
        // Ajusta a data inicial baseado no timeRange
        switch (timeRange) {
          case '7':
            dataInicial.setDate(dataFinal.getDate() - 7);
            break;
          case '15':
            dataInicial.setDate(dataFinal.getDate() - 15);
            break;
          case '30':
            dataInicial.setDate(dataFinal.getDate() - 30);
            break;
          case '90':
            dataInicial.setDate(dataFinal.getDate() - 90);
            break;
          case '180':
            dataInicial.setDate(dataFinal.getDate() - 180);
            break;
          case '365':
            dataInicial.setDate(dataFinal.getDate() - 365);
            break;
          default:
            dataInicial.setDate(dataFinal.getDate() - 30);
        }
      }

      // Ajusta as horas para início e fim do dia
      dataInicial.setHours(0, 0, 0, 0);
      dataFinal.setHours(23, 59, 59, 999);

      // Calcula saldos iniciais (até a data inicial)
      const saldosIniciais = movimentacoes.reduce((acc, m) => {
        const movData = new Date(m.data);
        if (movData < dataInicial) {
          if (!acc[m.conta]) acc[m.conta] = 0;
          acc[m.conta] += m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor);
        }
        return acc;
      }, {} as Record<string, number>);

      // Calcula saldos finais (até a data final)
      const saldosFinais = movimentacoes.reduce((acc, m) => {
        const movData = new Date(m.data);
        if (movData <= dataFinal) {
          if (!acc[m.conta]) acc[m.conta] = 0;
          acc[m.conta] += m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor);
        }
        return acc;
      }, {} as Record<string, number>);

      // Ordena as contas alfabeticamente
      const contasOrdenadas = Object.keys({ ...saldosIniciais, ...saldosFinais }).sort();
      
      // Cria objetos ordenados com todas as contas
      const saldosIniciaisOrdenados: Record<string, number> = {};
      const saldosFinaisOrdenados: Record<string, number> = {};
      
      contasOrdenadas.forEach(conta => {
        saldosIniciaisOrdenados[conta] = saldosIniciais[conta] || 0;
        saldosFinaisOrdenados[conta] = saldosFinais[conta] || 0;
      });

      // Calcula totais
      const totalInicial = Object.values(saldosIniciaisOrdenados).reduce((sum, value) => sum + value, 0);
      const totalFinal = Object.values(saldosFinaisOrdenados).reduce((sum, value) => sum + value, 0);

      // Calcula movimentações do período (entre data inicial e final)
      const movimentacoesPeriodo = movimentacoes.reduce((acc, m) => {
        const movData = new Date(m.data);
        if (movData >= dataInicial && movData <= dataFinal) {
          if (!acc.entradas[m.conta]) acc.entradas[m.conta] = 0;
          if (!acc.saidas[m.conta]) acc.saidas[m.conta] = 0;
          
          if (m.tipo === 'entrada') {
            acc.entradas[m.conta] += Number(m.valor);
            acc.entradas.total = (acc.entradas.total || 0) + Number(m.valor);
          } else {
            acc.saidas[m.conta] += Number(m.valor);
            acc.saidas.total = (acc.saidas.total || 0) + Number(m.valor);
          }
        }
        return acc;
      }, { entradas: { total: 0 }, saidas: { total: 0 } } as { 
        entradas: Record<string, number>, 
        saidas: Record<string, number> 
      });

      const saldosComTotal = {
        inicial: { ...saldosIniciaisOrdenados, total: totalInicial },
        final: { ...saldosFinaisOrdenados, total: totalFinal },
        movimentacoes: movimentacoesPeriodo
      };

      // Calcula dados dos últimos 12 meses independente do filtro
      const inicioUltimos12Meses = new Date(hoje);
      inicioUltimos12Meses.setMonth(hoje.getMonth() - 11);
      inicioUltimos12Meses.setDate(1);
      inicioUltimos12Meses.setHours(0, 0, 0, 0);

      const dadosPorPeriodo12Meses = movimentacoes
        .filter(m => new Date(m.data) >= inicioUltimos12Meses)
        .reduce((acc, m) => {
          const data = new Date(m.data);
          const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[chave]) {
            acc[chave] = { entradas: 0, saidas: 0 };
          }
          
          if (m.tipo === 'entrada') {
            acc[chave].entradas += Number(m.valor);
          } else {
            acc[chave].saidas += Number(m.valor);
          }
          
          return acc;
        }, {} as Record<string, { entradas: number; saidas: number }>);

      const dadosUltimos12Meses = Array.from({ length: 12 }, (_, i) => {
        const data = new Date(hoje);
        data.setMonth(hoje.getMonth() - (11 - i));
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        return {
          name: chave,
          entradas: dadosPorPeriodo12Meses[chave]?.entradas || 0,
          saidas: dadosPorPeriodo12Meses[chave]?.saidas || 0
        };
      });

      return {
        saldosPorConta: saldosComTotal,
        dadosUltimos12Meses
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      return {
        saldosPorConta: {
          inicial: { total: 0 },
          final: { total: 0 },
          movimentacoes: { entradas: {}, saidas: {} }
        },
        dadosUltimos12Meses: []
      };
    }
  }, [movimentacoes]);

  const getPeriodoFormatado = () => {
    try {
      if (timeRange === 'custom' && dateRange.from && dateRange.to) {
        return `${format(dateRange.from, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até ${format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
      }

      const hoje = new Date();
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - Number(timeRange));
      
      return `${format(inicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até ${format(hoje, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    } catch (error) {
      console.error('Erro ao formatar período:', error);
      return 'Período não definido';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard Financeiro
            </h1>
            <div className="flex items-center gap-2">
              <ChartBar className="h-6 w-6 text-primary" />
              <ChartLine className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Visualize e analise suas movimentações financeiras
          </p>
        </div>

        {/* Filters Section */}
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          <DashboardFilters
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            dateRange={dateRange}
            setDateRange={setDateRange}
            conta={conta}
            setConta={setConta}
            tipo={tipo}
            setTipo={setTipo}
            onReset={resetFilters}
          />
        </div>

        {/* Período Selecionado */}
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground">Período selecionado</h2>
              <p className="text-lg font-medium">{getPeriodoFormatado()}</p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="glass-card p-6">
          <BalanceCards 
            balances={saldosPorConta}
            closingDate={dateRange.to || new Date()}
            initialDate={dateRange.from || (() => {
              const date = new Date();
              date.setDate(date.getDate() - Number(timeRange));
              return date;
            })()}
          />
        </div>

        {/* Distribution Charts - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-card p-6 h-full">
            <div className="glass-content">
              <SaldoPorContaPie 
                saldos={saldosPorConta.final} 
              />
            </div>
          </div>
          <div className="glass-card p-6 h-full">
            <div className="glass-content">
              <ExpenseAnalysisChart filteredData={filteredData} />
            </div>
          </div>
        </div>

        {/* Movimentação Mensal (últimos 12 meses) */}
        <div className="glass-card p-6">
          <div className="glass-content">
            <TrendChart
              data={dadosUltimos12Meses}
              title="Movimentação Mensal (Últimos 12 Meses)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;