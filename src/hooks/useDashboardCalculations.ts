import { Movimentacao } from '@/types/movimentacao';
import { startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardCalculationsResult {
  filteredData: Movimentacao[];
  saldosPorConta: {
    inicial: Record<string, number>;
    final: Record<string, number>;
    movimentacoes: {
      entradas: Record<string, number>;
      saidas: Record<string, number>;
    };
  };
  dadosUltimos12Meses: Array<{
    name: string;
    entradas: number;
    saidas: number;
  }>;
}

export const useDashboardCalculations = (
  movimentacoes: Movimentacao[] | undefined,
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  }
): DashboardCalculationsResult => {
  // Filter data based on date range
  const filteredData = movimentacoes?.filter(mov => {
    if (!dateRange.from || !dateRange.to || !mov.data) return false;
    const movDate = new Date(mov.data);
    return isWithinInterval(movDate, { start: dateRange.from, end: dateRange.to });
  }) || [];

  // Initialize saldosPorConta with all accounts from movimentacoes
  const result = {
    inicial: {} as Record<string, number>,
    final: {} as Record<string, number>,
    movimentacoes: {
      entradas: {} as Record<string, number>,
      saidas: {} as Record<string, number>
    }
  };

  // Get unique accounts
  const contas = [...new Set(movimentacoes?.map(m => m.conta) || [])];

  // Initialize accounts with zero
  contas.forEach(conta => {
    result.inicial[conta] = 0;
    result.final[conta] = 0;
    result.movimentacoes.entradas[conta] = 0;
    result.movimentacoes.saidas[conta] = 0;
  });

  // Calculate initial balances (saldo inicial)
  movimentacoes?.forEach(mov => {
    if (!dateRange.from || !mov.data) return;
    const movDate = new Date(mov.data);
    if (movDate < dateRange.from) {
      if (mov.tipo === 'entrada') {
        result.inicial[mov.conta] = (result.inicial[mov.conta] || 0) + mov.valor;
      } else {
        result.inicial[mov.conta] = (result.inicial[mov.conta] || 0) - mov.valor;
      }
    }
  });

  // Calculate movimentações
  filteredData.forEach(mov => {
    if (mov.tipo === 'entrada') {
      result.movimentacoes.entradas[mov.conta] = (result.movimentacoes.entradas[mov.conta] || 0) + mov.valor;
    } else {
      result.movimentacoes.saidas[mov.conta] = (result.movimentacoes.saidas[mov.conta] || 0) + mov.valor;
    }
  });

  // Calculate final balances
  contas.forEach(conta => {
    result.final[conta] = result.inicial[conta] +
      (result.movimentacoes.entradas[conta] || 0) -
      (result.movimentacoes.saidas[conta] || 0);
  });

  // Calculate totals
  result.inicial.total = Object.values(result.inicial).reduce((acc, val) => acc + val, 0);
  result.final.total = Object.values(result.final).reduce((acc, val) => acc + val, 0);
  result.movimentacoes.entradas.total = Object.values(result.movimentacoes.entradas).reduce((acc, val) => acc + val, 0);
  result.movimentacoes.saidas.total = Object.values(result.movimentacoes.saidas).reduce((acc, val) => acc + val, 0);

  // Calculate monthly data
  const dadosUltimos12Meses = movimentacoes
    ?.reduce((acc, mov) => {
      const monthYear = format(new Date(mov.data), 'yyyy-MM');
      if (!acc[monthYear]) {
        acc[monthYear] = { entradas: 0, saidas: 0 };
      }
      if (mov.tipo === 'entrada') {
        acc[monthYear].entradas += mov.valor;
      } else {
        acc[monthYear].saidas += mov.valor;
      }
      return acc;
    }, {} as Record<string, { entradas: number; saidas: number }>);

  const monthlyData = Object.entries(dadosUltimos12Meses || {}).map(([monthYear, values]) => ({
    name: monthYear,
    ...values
  }));

  return {
    filteredData,
    saldosPorConta: result,
    dadosUltimos12Meses: monthlyData
  };
};