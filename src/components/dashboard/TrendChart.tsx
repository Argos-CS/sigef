import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrendChartProps {
  data: Array<{
    name: string;
    entradas: number;
    saidas: number;
  }>;
  title: string;
}

type PeriodOption = 'mensal' | 'trimestral' | 'anual';

const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('mensal');
  const containerRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setKey(prev => prev + 1);
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const aggregateData = useMemo(() => {
    if (selectedPeriod === 'mensal') {
      return [...data].sort((a, b) => a.name.localeCompare(b.name));
    }

    const aggregated = data.reduce((acc, curr) => {
      const [ano, mes] = curr.name.split('-');
      let period = '';

      if (selectedPeriod === 'trimestral') {
        const trimestre = Math.ceil(parseInt(mes) / 3);
        period = `${ano}-T${trimestre}`;
      } else if (selectedPeriod === 'anual') {
        period = ano;
      }

      if (!acc[period]) {
        acc[period] = { entradas: 0, saidas: 0, count: 0 };
      }

      acc[period].entradas += curr.entradas;
      acc[period].saidas += curr.saidas;
      acc[period].count += 1;

      return acc;
    }, {} as Record<string, { entradas: number; saidas: number; count: number }>);

    return Object.entries(aggregated)
      .map(([name, values]) => ({
        name,
        entradas: values.entradas,
        saidas: values.saidas
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, selectedPeriod]);

  const formatXAxis = useCallback((tickItem: string) => {
    if (selectedPeriod === 'mensal') {
      const [ano, mes] = tickItem.split('-');
      const meses = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      return `${meses[parseInt(mes) - 1]}/${ano}`;
    } else if (selectedPeriod === 'trimestral') {
      const [ano, trimestre] = tickItem.split('-');
      return `${trimestre}/${ano}`;
    }
    return tickItem;
  }, [selectedPeriod]);

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Evolução Mensal</CardTitle>
        <Select value={selectedPeriod} onValueChange={(value: PeriodOption) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="trimestral">Trimestral</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div ref={containerRef} className="h-[300px]" key={key}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={aggregateData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;