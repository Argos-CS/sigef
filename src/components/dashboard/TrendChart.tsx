import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatarMoeda } from '@/utils/formatters';

interface TrendChartProps {
  data: Array<{
    name: string;
    entradas: number;
    saidas: number;
  }>;
  title: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
  // Ordenar os dados por data
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  // Função para formatar a data do eixo X
  const formatXAxis = (tickItem: string) => {
    const [ano, mes] = tickItem.split('-');
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatarMoeda(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => formatarMoeda(Number(value))}
              labelFormatter={(label) => `Período: ${formatXAxis(String(label))}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="entradas" 
              stroke="#10B981" 
              name="Entradas"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="saidas" 
              stroke="#EF4444" 
              name="Saídas"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendChart;