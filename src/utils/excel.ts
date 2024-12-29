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
    { header: 'Categoria', key: 'categoria_id', width: 15 }
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
      categoria_id: mov.categoria_id
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
      data: row.getCell(1).value?.toString() || new Date().toISOString(),
      tipo: (row.getCell(2).value?.toString().toLowerCase() || 'entrada') as 'entrada' | 'saida',
      descricao: row.getCell(3).value?.toString() || '',
      valor: Number(row.getCell(4).value) || 0,
      conta: row.getCell(5).value?.toString() || '',
      categoria_id: row.getCell(6).value?.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: false
    };

    movimentacoes.push(movimentacao);
  });

  return movimentacoes;
}