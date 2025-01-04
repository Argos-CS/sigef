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

export interface BalanceteData {
  conta: string;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}

export interface Totals {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}

interface BalanceteTableProps {
  data: BalanceteData[];
  totals: Totals;
}

export const BalanceteTable: React.FC<BalanceteTableProps> = ({ data, totals }) => {
  return (
    <div className="rounded-lg border bg-card">
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
            <TableCell className="text-right">{formatarMoeda(totals.saldoInicial)}</TableCell>
            <TableCell className="text-right text-green-600">{formatarMoeda(totals.entradas)}</TableCell>
            <TableCell className="text-right text-red-600">{formatarMoeda(totals.saidas)}</TableCell>
            <TableCell className="text-right">{formatarMoeda(totals.saldoFinal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};