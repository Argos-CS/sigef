import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BalanceCardsProps {
  balances: {
    inicial: Record<string, number>;
    final: Record<string, number>;
    movimentacoes: {
      entradas: Record<string, number>;
      saidas: Record<string, number>;
    };
  };
  initialDate: Date;
  closingDate: Date;
}

export default function BalanceCards({ balances, initialDate, closingDate }: BalanceCardsProps) {
  const contas = Object.keys(balances.final).filter(conta => conta !== 'total');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Saldo inicial em: {initialDate.toLocaleDateString('pt-BR')}
        </h3>
        <h3 className="text-sm font-semibold text-muted-foreground">
          Saldo final em: {closingDate.toLocaleDateString('pt-BR')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contas.map(conta => (
          <Card key={conta} className="glass-card rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-shadow">
            <div className="glass-content">
              <CardHeader className="pb-2 border-b border-border/40">
                <CardTitle className="text-sm font-medium">{conta}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Saldo inicial:</span>
                  <span className={balances.inicial[conta] >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatarMoeda(balances.inicial[conta])}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Entradas:</span>
                  <span className="text-green-600">
                    {formatarMoeda(balances.movimentacoes.entradas[conta] || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Saídas:</span>
                  <span className="text-red-600">
                    {formatarMoeda(balances.movimentacoes.saidas[conta] || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                  <span className="text-muted-foreground">Saldo final:</span>
                  <span className={balances.final[conta] >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatarMoeda(balances.final[conta])}
                  </span>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}

        {/* Card de Saldo Consolidado */}
        <Card className="glass-card rounded-xl border border-border/40 shadow-sm bg-muted/50">
          <div className="glass-content">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-medium">Saldo Consolidado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Saldo inicial:</span>
                <span className={balances.inicial.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatarMoeda(balances.inicial.total)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Entradas:</span>
                <span className="text-green-600">
                  {formatarMoeda(balances.movimentacoes.entradas.total || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Saídas:</span>
                <span className="text-red-600">
                  {formatarMoeda(balances.movimentacoes.saidas.total || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                <span className="text-muted-foreground">Saldo final:</span>
                <span className={balances.final.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatarMoeda(balances.final.total)}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}