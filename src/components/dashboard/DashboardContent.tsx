import React from 'react';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { UnifiedFiltersSection } from './UnifiedFiltersSection';
import { SaldoPorContaPie } from './SaldoPorContaPie';
import { ExpenseAnalysisChart } from './ExpenseAnalysisChart';
import TrendChart from './TrendChart';

interface DashboardContentProps {
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
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  timeRange: string;
  setTimeRange: (value: string) => void;
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  onReset: () => void;
}

export const DashboardContent = ({ 
  filteredData, 
  saldosPorConta, 
  dadosUltimos12Meses,
  dateRange,
  timeRange,
  setTimeRange,
  setDateRange,
  onReset
}: DashboardContentProps) => {
  return (
    <div className="space-y-6">
      {/* Unified Filters Section */}
      <UnifiedFiltersSection
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={onReset}
        saldosPorConta={saldosPorConta}
      />

      {/* Distribution Charts - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-full">
          <div className="glass-content">
            <SaldoPorContaPie saldos={saldosPorConta.final} />
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
  );
};