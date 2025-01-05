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
    const currentDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const headerText = `Duque de Caxias, ${currentDate}`;
    
    // Header on each page
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const headerWidth = doc.getStringUnitWidth(headerText) * 10 / doc.internal.scaleFactor;
    doc.text(headerText, doc.internal.pageSize.width - 15 - headerWidth, 10);
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMONSTRATIVO CONTÁBIL', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text(monthYear.toUpperCase(), doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // 1. Balancete
    doc.setFontSize(12);
    doc.text('1. Balancete:', 15, 45);
    
    const tableData = [
      ...demonstrativo.map(row => [
        row.conta,
        formatarMoeda(row.saldoInicial),
        formatarMoeda(row.entradas),
        formatarMoeda(row.saidas),
        formatarMoeda(row.saldoFinal),
      ]),
      // Add totals row with bold style
      [
        { content: 'TOTAL', styles: { fontStyle: 'bold' } },
        { content: formatarMoeda(totals.saldoInicial), styles: { fontStyle: 'bold' } },
        { content: formatarMoeda(totals.entradas), styles: { fontStyle: 'bold' } },
        { content: formatarMoeda(totals.saidas), styles: { fontStyle: 'bold' } },
        { content: formatarMoeda(totals.saldoFinal), styles: { fontStyle: 'bold' } },
      ]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Conta', 'Saldo Inicial', 'Entradas', 'Saídas', 'Saldo Final']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    // 2. Saídas por Categoria
    const startY = (doc.lastAutoTable?.finalY || 50) + 15;
    doc.setFontSize(12);
    doc.text('2. Saídas por Categoria:', 15, startY);
    
    const categoriasData = Object.entries(categoriasSaida)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoria, valor]) => [
        categoria,
        formatarMoeda(valor),
        `${((valor / totals.saidas) * 100).toFixed(2)}%`,
      ]);

    doc.autoTable({
      startY: startY + 5,
      head: [['Categoria', 'Valor', '% do Total']],
      body: categoriasData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    // 3. Detalhamento dos Registros Financeiros
    const detailStartY = (doc.lastAutoTable?.finalY || startY) + 15;
    doc.setFontSize(12);
    doc.text('3. Detalhamento dos Registros Financeiros:', 15, detailStartY);

    const detailData = movimentacoesFiltradas
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((mov, index) => {
        const categoria = categoriasSecundarias.find(c => c.id === mov.categoria_id);
        const categoriaName = categoria ? categoria.nome : 'Sem categoria';
        const valor = Number(mov.valor);
        return [
          (index + 1).toString(),
          format(new Date(mov.data), 'dd/MM/yyyy'),
          mov.conta,
          categoriaName,
          mov.descricao,
          {
            content: formatarMoeda(valor),
            styles: {
              textColor: mov.tipo === 'entrada' ? [0, 128, 0] : [255, 0, 0],
              fontStyle: 'bold'
            }
          },
        ];
      });

    doc.autoTable({
      startY: detailStartY + 5,
      head: [['ID', 'Data', 'Conta', 'Categoria', 'Descrição', 'Valor']],
      body: detailData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
    });

    // 4. Assinaturas
    const signatureStartY = (doc.lastAutoTable?.finalY || detailStartY) + 30;
    doc.setFontSize(12);
    doc.text('4. Conferido e assinado por:', 15, signatureStartY);

    const signatures = [
      'Assistente Administrativo',
      'Tesoureiro 2',
      'Tesoureiro 1',
      'Auditor Fiscal',
      'Pastor Presidente'
    ];

    let currentY = signatureStartY + 20;
    signatures.forEach(title => {
      doc.line(15, currentY, 85, currentY);
      doc.setFontSize(8);
      doc.text(title, 15, currentY + 5);
      doc.line(95, currentY, 165, currentY);
      doc.text('Data: ___/___/______', 95, currentY + 5);
      currentY += 20;
    });

    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const footerText = `pág. ${i} de ${totalPages}`;
      const footerWidth = doc.getStringUnitWidth(footerText) * 8 / doc.internal.scaleFactor;
      doc.text(
        footerText,
        doc.internal.pageSize.width / 2 - footerWidth / 2,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`balancete-${monthYear}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return false;
  }
};