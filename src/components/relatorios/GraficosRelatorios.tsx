import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatarMoeda } from '@/utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface GraficosRelatoriosProps {
  dashboardData: {
    chartData: Array<{
      name: string;
      Dinheiro: number;
      Bradesco: number;
      Cora: number;
    }>;
    totalPorConta: {
      [key: string]: { entradas: number; saidas: number };
    };
  };
}

const GraficosRelatorios: React.FC<GraficosRelatoriosProps> = ({ dashboardData }) => {
  console.log('GraficosRelatorios - Received dashboardData:', dashboardData);

  // Validate and prepare chart data
  const sortedChartData = React.useMemo(() => {
    if (!dashboardData?.chartData?.length) {
      console.log('No chart data available');
      return [];
    }
    return [...dashboardData.chartData].sort((a, b) => a.name.localeCompare(b.name));
  }, [dashboardData.chartData]);

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    if (!dashboardData?.totalPorConta) {
      console.log('No total por conta data available');
      return [];
    }

    return Object.entries(dashboardData.totalPorConta)
      .filter(([name]) => name && typeof name === 'string')
      .map(([name, { entradas, saidas }]) => ({
        name,
        value: entradas - saidas
      }));
  }, [dashboardData.totalPorConta]);

  console.log('Processed pie chart data:', pieChartData);

  if (!dashboardData) {
    console.log('No dashboard data available');
    return <div>Carregando dados...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Bar dataKey="Dinheiro" fill="#4ade80" name="Dinheiro" />
              <Bar dataKey="Bradesco" fill="#f87171" name="Bradesco" />
              <Bar dataKey="Cora" fill="#60a5fa" name="Cora" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Distribuição por Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {pieChartData.length > 0 && (
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              )}
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default GraficosRelatorios;