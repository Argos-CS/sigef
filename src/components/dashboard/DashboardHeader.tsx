import React from 'react';
import { ChartBar, ChartLine } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard Financeiro
        </h1>
        <div className="flex items-center gap-2">
          <ChartBar className="h-6 w-6 text-primary" />
          <ChartLine className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="text-muted-foreground">
        Visualize e analise suas movimentações financeiras
      </p>
    </div>
  );
};