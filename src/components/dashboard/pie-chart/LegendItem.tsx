import React from 'react';
import { formatarMoeda } from '@/utils/formatters';

interface LegendItemProps {
  name: string;
  value: number;
  color: string;
}

export const LegendItem = ({ name, value, color }: LegendItemProps) => (
  <div className="flex items-center gap-3 py-2">
    <div
      className="w-4 h-4 rounded-full"
      style={{ backgroundColor: color }}
    />
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      <span className={`text-sm ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {formatarMoeda(value)}
      </span>
    </div>
  </div>
);