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

  // ... keep existing code (rest of the calculations)

  return {
    filteredData,
    saldosPorConta,
    dadosUltimos12Meses
  };
};
