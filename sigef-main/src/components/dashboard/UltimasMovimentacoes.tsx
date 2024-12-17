import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Movimentacao } from '@/hooks/useMovimentacoes';

interface UltimasMovimentacoesProps {
  movimentacoes: Movimentacao[];
}

const formatarMoeda = (valor: string) => {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const UltimasMovimentacoes: React.FC<UltimasMovimentacoesProps> = ({ movimentacoes }) => {
  const ultimasMovimentacoes = movimentacoes.slice(-5).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ultimasMovimentacoes.map((movimentacao, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(movimentacao.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}</TableCell>
                <TableCell>{movimentacao.conta}</TableCell>
                <TableCell>{movimentacao.descricao}</TableCell>
                <TableCell className={movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                  {formatarMoeda(movimentacao.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UltimasMovimentacoes;