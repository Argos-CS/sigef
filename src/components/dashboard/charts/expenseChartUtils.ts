export const EXPENSE_CHART_COLORS = [
  '#9333EA',
  '#A855F7',
  '#B97EFF',
  '#C9A3FF',
  '#D8BFFF',
  '#E7D6FF',
  '#F3E8FF',
  '#FAF5FF',
];

export const processExpenseData = (
  filteredData: any[],
  categorias: Array<{ id: string; nome: string }> | undefined
) => {
  if (!categorias || !filteredData) return [];

  const expensesByCategory = categorias.map(categoria => {
    const total = filteredData
      .filter(m => m.tipo === 'saida' && m.categoria_id === categoria.id)
      .reduce((sum, m) => sum + Number(m.valor), 0);

    return {
      categoria_nome: categoria.nome,
      total
    };
  });

  return expensesByCategory
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);
};