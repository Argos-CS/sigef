import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface PieChartSectionProps {
  data: Array<{
    name: string;
    value: number;
    valorReal: number;
  }>;
  colors: string[];
}

export const PieChartSection = ({ data, colors }: PieChartSectionProps) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={70}
        paddingAngle={5}
        dataKey="value"
        label={false}
      >
        {data.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
            strokeWidth={2}
          />
        ))}
      </Pie>
      <Tooltip content={ChartTooltip} />
    </PieChart>
  </ResponsiveContainer>
);