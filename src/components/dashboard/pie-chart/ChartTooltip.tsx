import React from 'react';
import { formatarMoeda } from '@/utils/formatters';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 p-3 rounded-lg shadow-lg border border-border/50">
        <p className="font-medium">{data.name}</p>
        <p className={`text-sm ${data.valorReal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatarMoeda(data.valorReal)}
        </p>
      </div>
    );
  }
  return null;
};