import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Movimentacao } from '@/hooks/useMovimentacoes';

interface GraficoMovimentacoesProps {
  movimentacoes: Movimentacao[];
}

const formatarMoeda = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const GraficoMovimentacoes: React.FC<GraficoMovimentacoesProps> = ({ movimentacoes }) => {
  const dadosGrafico = useMemo(() => {
    // Filtrar apenas as saídas e agrupar por categoria
    const saidasPorCategoria = movimentacoes
      .filter(m => m.tipo === 'saida' && m.categoria?.nivel === 'secundaria')
      .reduce((acc, m) => {
        if (!m.categoria_id || !m.categoria) return acc;
        
        const categoriaId = m.categoria_id;
        if (!acc[categoriaId]) {
          acc[categoriaId] = {
            categoria: categoriaId,
            total: 0,
            nome: m.categoria.nome
          };
        }
        acc[categoriaId].total += Number(m.valor);
        return acc;
      }, {} as Record<string, { categoria: string; total: number; nome: string }>);

    // Converter para array e ordenar por valor total decrescente
    return Object.values(saidasPorCategoria)
      .sort((a, b) => b.total - a.total)
      .map(item => ({
        nome: item.nome,
        total: item.total
      }));
  }, [movimentacoes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Fluxo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, dadosGrafico.length * 40)}>
          <BarChart
            data={dadosGrafico}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(value) => formatarMoeda(value)} />
            <YAxis 
              type="category" 
              dataKey="nome" 
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => formatarMoeda(Number(value))}
              labelStyle={{ color: 'black' }}
            />
            <Bar 
              dataKey="total" 
              fill="#f87171" 
              name="Total de Saídas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GraficoMovimentacoes;