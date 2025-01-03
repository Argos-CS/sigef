import React from 'react';
import { formatarMoeda } from '@/utils/formatters';

interface TotalBalanceProps {
  totalBalance: number;
}

export const TotalBalance = ({ totalBalance }: TotalBalanceProps) => (
  <div className="flex justify-end mb-4">
    <div className={`text-lg font-semibold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      Total: {formatarMoeda(totalBalance)}
    </div>
  </div>
);