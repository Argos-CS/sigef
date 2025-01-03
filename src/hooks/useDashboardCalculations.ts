import { useMemo } from 'react';
import { Movimentacao } from '@/types/movimentacao';
import { startOfMonth } from 'date-fns';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const useDashboardCalculations = (movimentacoes: Movimentacao[], dateRange: DateRange) => {
  const filteredData = useMemo(() => {
    console.log('useDashboardCalculations - Initial data:', {
      totalMovimentacoes: movimentacoes?.length,
      dateRange,
      hasMovimentacoes: !!movimentacoes,
      isArray: Array.isArray(movimentacoes)
    });

    if (!movimentacoes?.length) {
      console.log('No movimentações found');
      return [];
    }

    try {
      const dataFinal = dateRange.to ? new Date(dateRange.to) : new Date();
      let dataInicial = dateRange.from ? new Date(dateRange.from) : startOfMonth(dataFinal);

      dataInicial.setHours(0, 0, 0, 0);
      dataFinal.setHours(23, 59, 59, 999);

      console.log('Filtering movimentações:', {
        dataInicial: dataInicial.toISOString(),
        dataFinal: dataFinal.toISOString(),
        totalMovimentacoes: movimentacoes.length
      });

      const filtered = movimentacoes.filter(m => {
        const movData = new Date(m.data);
        const isInRange = movData >= dataInicial && movData <= dataFinal;
        if (!isInRange) {
          console.log('Filtered out movimentação:', {
            data: m.data,
            movData: movData.toISOString(),
            isBeforeStart: movData < dataInicial,
            isAfterEnd: movData > dataFinal
          });
        }
        return isInRange;
      });

      console.log('Filtering complete:', {
        totalFiltered: filtered.length,
        firstItem: filtered[0],
        lastItem: filtered[filtered.length - 1]
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  }, [movimentacoes, dateRange]);

  // Calculate saldosPorConta
  const saldosPorConta = useMemo(() => {
    const result = {
      inicial: {} as Record<string, number>,
      final: {} as Record<string, number>,
      movimentacoes: {
        entradas: {} as Record<string, number>,
        saidas: {} as Record<string, number>
      }
    };

    // Initialize with 0 for each conta
    const contas = [...new Set(movimentacoes.map(m => m.conta))];
    contas.forEach(conta => {
      result.inicial[conta] = 0;
      result.final[conta] = 0;
      result.movimentacoes.entradas[conta] = 0;
      result.movimentacoes.saidas[conta] = 0;
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
      result.final[conta] = (result.inicial[conta] || 0) +
        (result.movimentacoes.entradas[conta] || 0) -
        (result.movimentacoes.saidas[conta] || 0);
    });

    // Calculate totals
    result.inicial.total = Object.values(result.inicial).reduce((sum, val) => sum + val, 0);
    result.final.total = Object.values(result.final).reduce((sum, val) => sum + val, 0);
    result.movimentacoes.entradas.total = Object.values(result.movimentacoes.entradas).reduce((sum, val) => sum + val, 0);
    result.movimentacoes.saidas.total = Object.values(result.movimentacoes.saidas).reduce((sum, val) => sum + val, 0);

    return result;
  }, [filteredData, movimentacoes]);

  // Calculate dados últimos 12 meses
  const dadosUltimos12Meses = useMemo(() => {
    const months: Array<{ name: string; entradas: number; saidas: number }> = [];
    // Monthly data calculation logic here
    return months;
  }, [movimentacoes]);

  return {
    filteredData,
    saldosPorConta,
    dadosUltimos12Meses
  };
};
