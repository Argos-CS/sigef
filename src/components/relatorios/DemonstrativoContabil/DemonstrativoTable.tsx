import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarMoeda } from '@/utils/formatters';
import { ContaTipo } from '@/types/movimentacao';

interface DemonstrativoData {
  conta: ContaTipo;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}

interface DemonstrativoTableProps {
  data: DemonstrativoData[];
  categoriasSaida: Record<string, number>;
}

export const DemonstrativoTable: React.FC<DemonstrativoTableProps> = ({
  data,
  categoriasSaida
}) => {
  const totais = data.reduce((acc, curr) => ({
    saldoInicial: acc.saldoInicial + curr.saldoInicial,
    entradas: acc.entradas + curr.entradas,
    saidas: acc.saidas + curr.saidas,
    saldoFinal: acc.saldoFinal + curr.saldoFinal,
  }), {
    saldoInicial: 0,
    entradas: 0,
    saidas: 0,
    saldoFinal: 0,
  });

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead className="text-right">Saldo Inicial</TableHead>
            <TableHead className="text-right">Entradas</TableHead>
            <TableHead className="text-right">Saídas</TableHead>
            <TableHead className="text-right">Saldo Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.conta}>
              <TableCell className="font-medium">{row.conta}</TableCell>
              <TableCell className="text-right">{formatarMoeda(row.saldoInicial)}</TableCell>
              <TableCell className="text-right text-green-600">{formatarMoeda(row.entradas)}</TableCell>
              <TableCell className="text-right text-red-600">{formatarMoeda(row.saidas)}</TableCell>
              <TableCell className="text-right font-bold">{formatarMoeda(row.saldoFinal)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-muted/50">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-right">{formatarMoeda(totais.saldoInicial)}</TableCell>
            <TableCell className="text-right text-green-600">{formatarMoeda(totais.entradas)}</TableCell>
            <TableCell className="text-right text-red-600">{formatarMoeda(totais.saidas)}</TableCell>
            <TableCell className="text-right">{formatarMoeda(totais.saldoFinal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Detalhamento de Saídas por Categoria</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">% do Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(categoriasSaida).map(([categoria, valor]) => (
              <TableRow key={categoria}>
                <TableCell>{categoria}</TableCell>
                <TableCell className="text-right text-red-600">{formatarMoeda(valor)}</TableCell>
                <TableCell className="text-right">
                  {((valor / totais.saidas) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
