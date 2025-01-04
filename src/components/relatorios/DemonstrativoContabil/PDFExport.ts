import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatarMoeda } from '@/utils/formatters';
import { Movimentacao } from '@/types/movimentacao';
import { Categoria } from './types';

interface PDFExportProps {
  demonstrativo: any[];
  categoriasSaida: Record<string, number>;
  movimentacoesFiltradas: Movimentacao[];
  categoriasSecundarias: Categoria[];
  monthYear: string;
  totals: {
    saldoInicial: number;
    entradas: number;
    saidas: number;
    saldoFinal: number;
  };
}

export const exportToPDF = ({
  demonstrativo,
  categoriasSaida,
  movimentacoesFiltradas,
  categoriasSecundarias,
  monthYear,
  totals
}: PDFExportProps) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.text(`1. Balancete - ${monthYear}`, 14, 15);
    
    // Main table
    const tableData = [
      ...demonstrativo.map(row => [
        row.conta,
        formatarMoeda(row.saldoInicial),
        formatarMoeda(row.entradas),
        formatarMoeda(row.saidas),
        formatarMoeda(row.saldoFinal),
      ]),
      // Add totals row
      [
        'TOTAL',
        formatarMoeda(totals.saldoInicial),
        formatarMoeda(totals.entradas),
        formatarMoeda(totals.saidas),
        formatarMoeda(totals.saldoFinal),
      ]
    ];

    doc.autoTable({
      head: [['Conta', 'Saldo Inicial', 'Entradas', 'Saídas', 'Saldo Final']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    // Categories table
    const startY = doc.lastAutoTable.finalY + 15;
    doc.text('2. Saídas por Categoria', 14, startY);
    
    const categoriasData = Object.entries(categoriasSaida)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoria, valor]) => [
        categoria,
        formatarMoeda(valor),
        `${((valor / totals.saidas) * 100).toFixed(2)}%`,
      ]);

    doc.autoTable({
      head: [['Categoria', 'Valor', '% do Total']],
      body: categoriasData,
      startY: startY + 5,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    // Detailed expenses table
    const detailStartY = doc.lastAutoTable.finalY + 15;
    doc.text('3. Detalhamento de Saídas', 14, detailStartY);

    const detailData = movimentacoesFiltradas
      .filter(mov => mov.tipo === 'saida')
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((mov, index) => {
        const categoria = categoriasSecundarias.find(c => c.id === mov.categoria_id);
        return [
          (index + 1).toString(),
          format(new Date(mov.data), 'dd/MM/yyyy'),
          mov.conta,
          categoria ? `${categoria.codigo} - ${categoria.nome}` : '',
          mov.descricao,
          formatarMoeda(Number(mov.valor)),
        ];
      });

    doc.autoTable({
      head: [['ID', 'Data', 'Conta', 'Categoria', 'Descrição', 'Valor']],
      body: detailData,
      startY: detailStartY + 5,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    doc.save(`balancete-${monthYear}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return false;
  }
};