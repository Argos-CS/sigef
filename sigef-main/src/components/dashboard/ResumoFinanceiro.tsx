import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Movimentacao } from '@/hooks/useMovimentacoes';

interface ResumoFinanceiroProps {
  movimentacoes: Movimentacao[];
}

const formatarMoeda = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ResumoFinanceiro: React.FC<ResumoFinanceiroProps> = ({ movimentacoes }) => {
  const totalEntradas = movimentacoes.reduce((sum, m) => m.tipo === 'entrada' ? sum + Number(m.valor) : sum, 0);
  const totalSaidas = movimentacoes.reduce((sum, m) => m.tipo === 'saida' ? sum + Number(m.valor) : sum, 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Total de Entradas</p>
          <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalEntradas)}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Total de Saídas</p>
          <p className="text-2xl font-bold text-red-600">{formatarMoeda(totalSaidas)}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoFinanceiro;