import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from '@/utils/formatters';

interface ResumoFinanceiroProps {
  dashboardData: {
    totalPorConta: {
      [key: string]: { entradas: number; saidas: number };
    };
    totalEntradas: number;
    totalSaidas: number;
    saldo: number;
  };
}

const ResumoFinanceiro: React.FC<ResumoFinanceiroProps> = ({ dashboardData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(dashboardData.totalPorConta).map(([conta, { entradas, saidas }]) => (
        <Card key={conta}>
          <CardHeader>
            <CardTitle>{conta}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Entradas: {formatarMoeda(entradas)}</p>
            <p>Saídas: {formatarMoeda(saidas)}</p>
            <p className={`font-bold ${entradas - saidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              Saldo: {formatarMoeda(entradas - saidas)}
            </p>
          </CardContent>
        </Card>
      ))}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Saldo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${dashboardData.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatarMoeda(dashboardData.saldo)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoFinanceiro;