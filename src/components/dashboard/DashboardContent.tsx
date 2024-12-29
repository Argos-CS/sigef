import React from 'react';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import BalanceCards from './BalanceCards';
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
}

export const DashboardContent = ({ 
  filteredData, 
  saldosPorConta, 
  dadosUltimos12Meses,
  dateRange 
}: DashboardContentProps) => {
  return (
    <>
      {/* Balance Cards */}
      <div className="glass-card p-6">
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
    </>
  );
};