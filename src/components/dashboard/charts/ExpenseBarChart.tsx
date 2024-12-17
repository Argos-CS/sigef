import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseData {
  categoria_nome: string;
  total: number;
}

interface ExpenseBarChartProps {
  data: ExpenseData[];
  colors: string[];
}

export const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({ data, colors }) => {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(value, { notation: 'compact' })}
          />
          <YAxis
            type="category" 
            dataKey="categoria_nome"
            width={100}
            tick={{ fontSize: 14 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[Math.floor((index / data.length) * colors.length)]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};