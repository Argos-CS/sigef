import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { ExpenseBarChart } from './charts/ExpenseBarChart';
import { EXPENSE_CHART_COLORS, processExpenseData } from './charts/expenseChartUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseAnalysisChartProps {
  filteredData: Movimentacao[];
}

export const ExpenseAnalysisChart = ({ filteredData }: ExpenseAnalysisChartProps) => {
  const { data: categorias } = useQuery({
    queryKey: ['categorias-secundarias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_plano_contas')
        .select('id, nome')
        .eq('nivel', 'secundaria')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const chartData = React.useMemo(() => 
    processExpenseData(filteredData, categorias),
    [categorias, filteredData]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseBarChart 
          data={chartData}
          colors={EXPENSE_CHART_COLORS}
        />
      </CardContent>
    </Card>
  );
};