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

interface SaidasPorCategoriaTableProps {
  categoriasSaida: Record<string, number>;
  totalSaidas: number;
}

export const SaidasPorCategoriaTable: React.FC<SaidasPorCategoriaTableProps> = ({
  categoriasSaida,
  totalSaidas
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">% do Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(categoriasSaida)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([categoria, valor]) => (
              <TableRow key={categoria}>
                <TableCell>{categoria}</TableCell>
                <TableCell className="text-right text-red-600">
                  {formatarMoeda(valor)}
                </TableCell>
                <TableCell className="text-right">
                  {((valor / totalSaidas) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};