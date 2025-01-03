import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LegendItem } from './pie-chart/LegendItem';
import { PieChartSection } from './pie-chart/PieChartSection';
import { TotalBalance } from './pie-chart/TotalBalance';

interface SaldoPorContaPieProps {
  saldos: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SaldoPorContaPie({ saldos }: SaldoPorContaPieProps) {
  const data = Object.entries(saldos)
    .filter(([conta]) => conta !== 'total' && saldos[conta] !== 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([conta, valor]) => ({
      name: conta,
      value: Math.abs(valor),
      valorReal: valor
    }));

  const totalBalance = saldos.total || 0;

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center glass-card">
        <p className="text-muted-foreground">Nenhum saldo disponível</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-[1.2rem] font-semibold mb-4">Saldo Atual</h3>
        <TotalBalance totalBalance={totalBalance} />
        <div className="flex items-center min-h-[220px]">
          {/* Legenda à esquerda */}
          <div className="w-1/3 flex flex-col justify-center space-y-2 pr-8">
            {data.map((entry, index) => (
              <LegendItem
                key={entry.name}
                name={entry.name}
                value={entry.valorReal}
                color={COLORS[index % COLORS.length]}
              />
            ))}
          </div>

          {/* Gráfico à direita */}
          <div className="w-2/3 flex items-center">
            <PieChartSection data={data} colors={COLORS} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}