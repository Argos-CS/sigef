import React from 'react';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { UnifiedFiltersSection } from './UnifiedFiltersSection';
import { SaldoPorContaPie } from './SaldoPorContaPie';
import { ExpenseAnalysisChart } from './ExpenseAnalysisChart';
import TrendChart from './TrendChart';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  setDateRange,
  onReset
}: DashboardContentProps) => {
  console.log('DashboardContent render:', {
    filteredDataLength: filteredData?.length,
    hasSaldos: !!saldosPorConta,
    hasDadosMensais: !!dadosUltimos12Meses,
    dateRange: {
      from: dateRange.from?.toISOString(),
      to: dateRange.to?.toISOString()
    }
  });

  const hasNoData = !filteredData || !saldosPorConta || !dadosUltimos12Meses;

  if (hasNoData) {
    console.log('No data available:', {
      filteredData: !!filteredData,
      saldosPorConta: !!saldosPorConta,
      dadosUltimos12Meses: !!dadosUltimos12Meses
    });
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar os dados do dashboard. Por favor, atualize a página ou tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedFiltersSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={onReset}
        saldosPorConta={saldosPorConta}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-border/40 p-6">
          <div className="glass-content">
            <h3 className="text-[1.2rem] font-semibold mb-4">Saldo Atual</h3>
            <SaldoPorContaPie saldos={saldosPorConta.final} />
          </div>
        </div>
        <div className="glass-card rounded-xl border border-border/40 p-6">
          <div className="glass-content">
            <ExpenseAnalysisChart 
              filteredData={filteredData} 
              dateRange={dateRange}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/40 p-6">
        <div className="glass-content">
          <TrendChart
            data={dadosUltimos12Meses}
            title="Evolução Gráfica"
            titleClassName="text-[1.2rem]"
          />
        </div>
      </div>
    </div>
  );
};