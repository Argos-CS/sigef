import React, { useState } from 'react';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { startOfMonth } from 'date-fns';
import { useDashboardCalculations } from '@/hooks/useDashboardCalculations';
import { FinancialAssistant } from '@/components/ai/FinancialAssistant';

const Dashboard = () => {
  console.log('Dashboard component rendering');
  
  const { movimentacoes } = useMovimentacoes();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    console.log('Initializing date range:', {
      firstDayOfMonth: firstDayOfMonth.toISOString(),
      today: today.toISOString()
    });
    return {
      from: firstDayOfMonth,
      to: today
    };
  });

  console.log('Current state:', {
    hasMovimentacoes: !!movimentacoes,
    movimentacoesLength: movimentacoes?.length,
    dateRange: {
      from: dateRange.from?.toISOString(),
      to: dateRange.to?.toISOString()
    }
  });

  const resetFilters = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    console.log('Resetting filters:', {
      firstDayOfMonth: firstDayOfMonth.toISOString(),
      today: today.toISOString()
    });
    setDateRange({ from: firstDayOfMonth, to: today });
  };

  const {
    filteredData,
    saldosPorConta,
    dadosUltimos12Meses
  } = useDashboardCalculations(movimentacoes, dateRange);

  console.log('Dashboard calculations result:', {
    totalMovimentacoes: movimentacoes?.length,
    filteredDataLength: filteredData?.length,
    hasBalances: !!saldosPorConta?.final,
    hasTrendData: !!dadosUltimos12Meses?.length
  });

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

        <div className="mt-8">
          <FinancialAssistant />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;