import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardFilters from './DashboardFilters';
import { PeriodDisplay } from './PeriodDisplay';
import BalanceCards from './BalanceCards';

interface UnifiedFiltersSectionProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  onReset: () => void;
  saldosPorConta: {
    inicial: Record<string, number>;
    final: Record<string, number>;
    movimentacoes: {
      entradas: Record<string, number>;
      saidas: Record<string, number>;
    };
  };
}

export const UnifiedFiltersSection = ({
  timeRange,
  setTimeRange,
  dateRange,
  setDateRange,
  onReset,
  saldosPorConta
}: UnifiedFiltersSectionProps) => {
  return (
    <div className="space-y-6 bg-background/60 p-6 rounded-xl border border-border/40">
      {/* Filters */}
      <div className="glass-card rounded-xl">
        <div className="glass-content">
          <DashboardFilters
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Period Display */}
      <div className="glass-card rounded-xl">
        <div className="glass-content">
          <PeriodDisplay 
            timeRange={timeRange} 
            dateRange={dateRange} 
          />
        </div>
      </div>

      {/* Balance Cards */}
      <div className="glass-card rounded-xl">
        <div className="glass-content">
          <BalanceCards 
            balances={saldosPorConta}
            closingDate={dateRange.to || new Date()}
            initialDate={dateRange.from || (() => {
              const date = new Date();
              date.setDate(date.getDate() - 30);
              return date;
            })()}
          />
        </div>
      </div>
    </div>
  );
};