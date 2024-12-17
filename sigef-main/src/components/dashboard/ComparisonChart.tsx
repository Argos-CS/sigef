import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatarMoeda } from '@/utils/formatters';

interface ComparisonChartProps {
  data: Array<{
    name: string;
    Dinheiro: number;
    Bradesco: number;
    Cora: number;
  }>;
  title: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatarMoeda(value)} />
            <Tooltip 
              formatter={(value) => formatarMoeda(Number(value))}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend />
            <Bar dataKey="Dinheiro" fill="#4ade80" name="Dinheiro" />
            <Bar dataKey="Bradesco" fill="#f87171" name="Bradesco" />
            <Bar dataKey="Cora" fill="#60a5fa" name="Cora" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;