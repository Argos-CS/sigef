import React from 'react';
import DashboardFilters from './DashboardFilters';
import { PeriodDisplay } from './PeriodDisplay';
import BalanceCards from './BalanceCards';

interface UnifiedFiltersSectionProps {
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
  dateRange,
  setDateRange,
  onReset,
  saldosPorConta
}: UnifiedFiltersSectionProps) => {
  return (
    <div className="space-y-6 bg-background/60 p-6 rounded-xl border border-border/40">
      <div className="grid gap-6">
        {/* Filters and Period Display */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <div className="glass-content">
              <DashboardFilters
                dateRange={dateRange}
                setDateRange={setDateRange}
                onReset={onReset}
              />
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="glass-content">
              <PeriodDisplay dateRange={dateRange} />
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="glass-card rounded-xl p-6">
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
    </div>
  );
};