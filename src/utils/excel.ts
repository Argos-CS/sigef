import ExcelJS from 'exceljs';
import { Movimentacao, ContaTipo, MovimentacaoTipo } from '@/types/movimentacao';

export async function exportarParaExcel(movimentacoes: Movimentacao[], filename: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Movimentações');

  // Definir colunas
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
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Adicionar dados
  movimentacoes.forEach(mov => {
    worksheet.addRow({
      data: mov.data,
      tipo: mov.tipo,
      descricao: mov.descricao,
      valor: mov.valor,
      conta: mov.conta,
      categoria_id: mov.categoria_id
    });
  });

  // Gerar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function importarDoExcel(file: File): Promise<Movimentacao[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  
  const worksheet = workbook.getWorksheet(1);
  const movimentacoes: Movimentacao[] = [];

  // Pular a primeira linha (cabeçalho)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const movimentacao: Movimentacao = {
      id: crypto.randomUUID(),
      data: row.getCell(1).value?.toString() || new Date().toISOString(),
      tipo: (row.getCell(2).value?.toString()?.toLowerCase() || 'entrada') as MovimentacaoTipo,
      descricao: row.getCell(3).value?.toString() || '',
      valor: Number(row.getCell(4).value) || 0,
      conta: (row.getCell(5).value?.toString() || 'CAIXA') as ContaTipo,
      categoria_id: row.getCell(6).value?.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: false
    };

    movimentacoes.push(movimentacao);
  });

  return movimentacoes;
}