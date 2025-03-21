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
  console.log('Categorias Saída:', categoriasSaida);
  
  // Garantir que temos dados válidos antes de processar
  const categoriasValidas = Object.entries(categoriasSaida || {})
    .filter(([nome]) => nome && typeof nome === 'string')
    .map(([categoria, valor]) => {
      const categoriaName = categoria.includes(' - ') ? categoria.split(' - ')[1] : categoria;
      return { name: categoriaName, valor };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log('Categorias Processadas:', categoriasValidas);

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
          {categoriasValidas.map(({ name, valor }) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell className="text-right text-red-600">
                {formatarMoeda(valor)}
              </TableCell>
              <TableCell className="text-right">
                {totalSaidas > 0 ? ((valor / totalSaidas) * 100).toFixed(2) : '0.00'}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};