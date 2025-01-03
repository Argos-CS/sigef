import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Movimentacao } from '@/types/movimentacao';
import { formatarMoeda } from '@/utils/formatters';
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
  const getPeriodText = () => {
    if (!dateRange.from || !dateRange.to) return '';
    return `(${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })})`;
  };

  const chartData = React.useMemo(() => {
    const aggregatedData = filteredData.reduce((acc, mov) => {
      const categoria = mov.categoria?.nome || 'Sem categoria';
      if (!acc[categoria]) {
        acc[categoria] = { entradas: 0, saidas: 0 };
      }
      if (mov.tipo === 'entrada') {
        acc[categoria].entradas += Number(mov.valor);
      } else {
        acc[categoria].saidas += Number(mov.valor);
      }
      return acc;
    }, {} as Record<string, { entradas: number; saidas: number }>);

    return Object.entries(aggregatedData)
      .map(([categoria, valores]) => ({
        categoria,
        entradas: valores.entradas,
        saidas: valores.saidas
      }))
      .sort((a, b) => b.saidas - a.saidas);
  }, [filteredData]);

  return (
    <div className="h-full">
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-lg font-semibold">Fluxo de Despesas {getPeriodText()}</h3>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 130 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(value) => formatarMoeda(value)} />
            <YAxis 
              dataKey="categoria" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip 
              formatter={(value) => formatarMoeda(Number(value))}
              labelStyle={{ color: 'black' }}
            />
            <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
            <Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};