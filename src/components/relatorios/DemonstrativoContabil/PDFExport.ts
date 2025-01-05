import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatarMoeda } from '@/utils/formatters';
import { BalanceteData, Categoria } from './types';

interface ExportToPDFParams {
  demonstrativo: BalanceteData[];
  categoriasSaida: Record<string, number>;
  movimentacoesFiltradas: any[];
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
}: ExportToPDFParams): boolean => {
  try {
    console.log('Starting PDF export...');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Título
    doc.setFontSize(16);
    doc.text('Demonstrativo Contábil', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(monthYear, pageWidth / 2, 30, { align: 'center' });

    // 1. Balancete
    doc.setFontSize(14);
    doc.text('1. Balancete', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Conta', 'Saldo Inicial', 'Entradas', 'Saídas', 'Saldo Final']],
      body: [
        ...demonstrativo.map(item => [
          item.conta,
          formatarMoeda(item.saldoInicial),
          formatarMoeda(item.entradas),
          formatarMoeda(item.saidas),
          formatarMoeda(item.saldoFinal)
        ]),
        [
          'Total',
          formatarMoeda(totals.saldoInicial),
          formatarMoeda(totals.entradas),
          formatarMoeda(totals.saidas),
          formatarMoeda(totals.saldoFinal)
        ]
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // 2. Saídas por Categoria
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.text('2. Saídas por Categoria', 14, finalY + 15);

    const categoriasData = Object.entries(categoriasSaida)
      .filter(([_, valor]) => valor > 0)
      .map(([categoria, valor]) => [
        categoria,
        formatarMoeda(valor),
        ((valor / totals.saidas) * 100).toFixed(2) + '%'
      ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Categoria', 'Valor', '% do Total']],
      body: [
        ...categoriasData,
        ['Total', formatarMoeda(totals.saidas), '100%']
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // 3. Detalhamento dos Registros
    const finalY2 = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.text('3. Detalhamento dos Registros Financeiros', 14, finalY2 + 15);

    const movimentacoesFormatadas = movimentacoesFiltradas
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map(mov => {
        const categoria = categoriasSecundarias.find(c => c.id === mov.categoria_id);
        return [
          format(new Date(mov.data), 'dd/MM/yyyy'),
          mov.tipo === 'entrada' ? 'Entrada' : 'Saída',
          mov.conta,
          categoria?.nome || 'Sem categoria',
          mov.descricao,
          formatarMoeda(mov.valor)
        ];
      });

    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Data', 'Tipo', 'Conta', 'Categoria', 'Descrição', 'Valor']],
      body: movimentacoesFormatadas,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // Footer on each page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    console.log('PDF generation completed successfully');
    // Save the PDF
    doc.save(`balancete-${format(new Date(), 'yyyy-MM')}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
};