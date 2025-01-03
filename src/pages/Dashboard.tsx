import React, { useState, useMemo } from 'react';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { startOfMonth } from 'date-fns';

const Dashboard = () => {
  const { movimentacoes } = useMovimentacoes();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    // Define data inicial como primeiro dia do mês corrente
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    
    return {
      from: firstDayOfMonth,
      to: today
    };
  });

  const resetFilters = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    setDateRange({ from: firstDayOfMonth, to: today });
  };

  const filteredData = useMemo(() => {
    try {
      if (!movimentacoes || movimentacoes.length === 0) {
        console.log('Nenhuma movimentação encontrada');
        return [];
      }

      const dataFinal = dateRange.to ? new Date(dateRange.to) : new Date();
      let dataInicial = dateRange.from ? new Date(dateRange.from) : startOfMonth(dataFinal);

      // Ajusta as horas para comparação precisa
      dataInicial.setHours(0, 0, 0, 0);
      dataFinal.setHours(23, 59, 59, 999);

      console.log('Filtrando movimentações:', {
        dataInicial: dataInicial.toISOString(),
        dataFinal: dataFinal.toISOString(),
        totalMovimentacoes: movimentacoes.length
      });

      return movimentacoes.filter(m => {
        const movData = new Date(m.data);
        return movData >= dataInicial && movData <= dataFinal;
      });
    } catch (error) {
      console.error('Erro ao filtrar dados:', error);
      return [];
    }
  }, [movimentacoes, dateRange]);

  const {
    saldosPorConta,
    dadosUltimos12Meses
  } = useMemo(() => {
    try {
      const dataFinal = dateRange.to ? new Date(dateRange.to) : new Date();
      let dataInicial = dateRange.from ? new Date(dateRange.from) : startOfMonth(dataFinal);

      dataInicial.setHours(0, 0, 0, 0);
      dataFinal.setHours(23, 59, 59, 999);

      console.log('Calculando saldos:', {
        dataInicial: dataInicial.toISOString(),
        dataFinal: dataFinal.toISOString()
      });

      const saldosIniciais = movimentacoes.reduce((acc, m) => {
        const movData = new Date(m.data);
        if (movData < dataInicial) {
          if (!acc[m.conta]) acc[m.conta] = 0;
          acc[m.conta] += m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor);
        }
        return acc;
      }, {} as Record<string, number>);

      const saldosFinais = movimentacoes.reduce((acc, m) => {
        const movData = new Date(m.data);
        if (movData <= dataFinal) {
          if (!acc[m.conta]) acc[m.conta] = 0;
          acc[m.conta] += m.tipo === 'entrada' ? Number(m.valor) : -Number(m.valor);
        }
        return acc;
      }, {} as Record<string, number>);

      const contasOrdenadas = Object.keys({ ...saldosIniciais, ...saldosFinais }).sort();
      
      const saldosIniciaisOrdenados: Record<string, number> = {};
      const saldosFinaisOrdenados: Record<string, number> = {};
      
      contasOrdenadas.forEach(conta => {
        saldosIniciaisOrdenados[conta] = saldosIniciais[conta] || 0;
        saldosFinaisOrdenados[conta] = saldosFinais[conta] || 0;
      });

      const totalInicial = Object.values(saldosIniciaisOrdenados).reduce((sum, value) => sum + value, 0);
      const totalFinal = Object.values(saldosFinaisOrdenados).reduce((sum, value) => sum + value, 0);

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

      // Cálculo dos dados dos últimos 12 meses
      const inicioUltimos12Meses = new Date(dataFinal);
      inicioUltimos12Meses.setMonth(dataFinal.getMonth() - 11);
      inicioUltimos12Meses.setDate(1);
      inicioUltimos12Meses.setHours(0, 0, 0, 0);

      console.log('Calculando dados dos últimos 12 meses:', {
        inicioUltimos12Meses: inicioUltimos12Meses.toISOString(),
        dataFinal: dataFinal.toISOString()
      });

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
        const data = new Date(dataFinal);
        data.setMonth(dataFinal.getMonth() - (11 - i));
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
  }, [movimentacoes, dateRange]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />
        
        <DashboardContent 
          filteredData={filteredData}
          saldosPorConta={saldosPorConta}
          dadosUltimos12Meses={dadosUltimos12Meses}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onReset={resetFilters}
        />
      </div>
    </div>
  );
};

export default Dashboard;
