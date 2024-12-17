import ExcelJS from 'exceljs';
import { Movimentacao } from '@/types/movimentacao';

export async function exportarParaExcel(movimentacoes: Movimentacao[], nomeArquivo: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Movimentações');

  // Definir cabeçalhos
  worksheet.columns = [
    { header: 'Data', key: 'data', width: 15 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Descrição', key: 'descricao', width: 30 },
    { header: 'Valor', key: 'valor', width: 15 },
    { header: 'Conta', key: 'conta', width: 15 },
    { header: 'Categoria', key: 'categoria', width: 15 }
  ];

  // Estilo para o cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Adicionar dados
  movimentacoes.forEach(mov => {
    worksheet.addRow({
      data: new Date(mov.data),
      tipo: mov.tipo.toUpperCase(),
      descricao: mov.descricao,
      valor: mov.valor,
      conta: mov.conta,
      categoria: mov.categoria
    });
  });

  // Formatar coluna de data
  worksheet.getColumn('data').numFmt = 'dd/mm/yyyy';
  
  // Formatar coluna de valor
  worksheet.getColumn('valor').numFmt = '"R$"#,##0.00';

  // Gerar o arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Criar blob e fazer download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nomeArquivo}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function importarDoExcel(file: File): Promise<Movimentacao[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1);
  
  const movimentacoes: Movimentacao[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // Pular a linha do cabeçalho
    if (rowNumber === 1) return;

    const movimentacao: Movimentacao = {
      id: crypto.randomUUID(),
      data: row.getCell(1).value as Date,
      tipo: (row.getCell(2).value as string).toLowerCase() as 'entrada' | 'saida',
      descricao: row.getCell(3).value as string,
      valor: Number(row.getCell(4).value),
      conta: row.getCell(5).value as string,
      categoria: row.getCell(6).value as string
    };

    movimentacoes.push(movimentacao);
  });

  return movimentacoes;
} 