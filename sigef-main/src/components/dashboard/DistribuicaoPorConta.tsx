import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from '@/utils/formatters';

interface DistribuicaoPorContaProps {
  movimentacoes: Array<{
    data: string;
    tipo: 'entrada' | 'saida';
    conta: string;
    valor: number;
  }>;
}

export const DistribuicaoPorConta = ({ movimentacoes }: DistribuicaoPorContaProps) => {
  const dadosPorConta = useMemo(() => {
    const dados = movimentacoes.reduce((acc, mov) => {
      if (!acc[mov.conta]) {
        acc[mov.conta] = {
          entradas: 0,
          saidas: 0
        };
      }
      if (mov.tipo === 'entrada') {
        acc[mov.conta].entradas += mov.valor;
      } else {
        acc[mov.conta].saidas += mov.valor;
      }
      return acc;
    }, {} as Record<string, { entradas: number; saidas: number }>);

    // Retorna os dados ordenados alfabeticamente por conta
    return Object.entries(dados)
      .sort(([contaA], [contaB]) => contaA.localeCompare(contaB))
      .map(([conta, valores]) => ({
        conta,
        ...valores
      }));
  }, [movimentacoes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentação por Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {dadosPorConta.map(({ conta, entradas, saidas }) => (
            <div key={conta} className="space-y-2">
              <div className="text-sm font-medium">{conta}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-green-600">
                  Entradas: {formatarMoeda(entradas)}
                </div>
                <div className="text-sm text-red-600">
                  Saídas: {formatarMoeda(saidas)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};