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
import { Movimentacao } from '@/types/movimentacao';

interface DetalhamentoSaidasTableProps {
  movimentacoes: Movimentacao[];
}

export const DetalhamentoSaidasTable: React.FC<DetalhamentoSaidasTableProps> = ({
  movimentacoes
}) => {
  const saidasOrdenadas = movimentacoes
    .filter(mov => mov.tipo === 'saida')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {saidasOrdenadas.map((mov, index) => (
            <TableRow key={mov.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{new Date(mov.data).toLocaleDateString()}</TableCell>
              <TableCell>{mov.conta}</TableCell>
              <TableCell>{mov.categoria_id}</TableCell>
              <TableCell>{mov.descricao}</TableCell>
              <TableCell className="text-right text-red-600">
                {formatarMoeda(Number(mov.valor))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};