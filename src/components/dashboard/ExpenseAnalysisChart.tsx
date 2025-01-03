import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { ExpenseBarChart } from './charts/ExpenseBarChart';
import { EXPENSE_CHART_COLORS, processExpenseData } from './charts/expenseChartUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpenseAnalysisChartProps {
  filteredData: Movimentacao[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const ExpenseAnalysisChart = ({ filteredData, dateRange }: ExpenseAnalysisChartProps) => {
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

  const getPeriodText = () => {
    if (!dateRange.from || !dateRange.to) return '';
    return `(${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Despesas {getPeriodText()}</CardTitle>
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