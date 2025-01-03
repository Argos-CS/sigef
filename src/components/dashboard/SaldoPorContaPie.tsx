import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatarMoeda } from '@/utils/formatters';

interface SaldoPorContaPieProps {
  saldos: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SaldoPorContaPie({ saldos }: SaldoPorContaPieProps) {
  const data = Object.entries(saldos)
    .filter(([conta]) => conta !== 'total' && saldos[conta] !== 0)
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically by account name
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

  const LegendItem = ({ name, value, color }: { name: string; value: number; color: string }) => (
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

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saldo Atual</h3>
        <div className={`text-lg font-semibold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          Total: {formatarMoeda(totalBalance)}
        </div>
      </div>
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
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
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
