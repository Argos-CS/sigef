import { format, parseISO, subMonths } from 'https://esm.sh/date-fns@2.30.0';
import { ptBR } from 'https://esm.sh/date-fns@2.30.0/locale';

export function prepararContextoFinanceiro(movimentacoes: any[]) {
  const dataAtual = new Date();
  const tresMesesAtras = subMonths(dataAtual, 3);

  const calcularSaldoAteData = (dataFinal: Date) => {
    const saldos = {
      Bradesco: 0,
      Cora: 0,
      Dinheiro: 0
    };

    movimentacoes?.forEach(mov => {
      if (new Date(mov.data) <= dataFinal) {
        const valor = Number(mov.valor);
        if (mov.tipo === 'entrada') {
          saldos[mov.conta] += valor;
        } else {
          saldos[mov.conta] -= valor;
        }
      }
    });

    return saldos;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const calcularTotaisPorCategoria = () => {
    const totais: Record<string, number> = {};
    let totalGeral = 0;

    movimentacoes?.forEach(mov => {
      if (mov.tipo === 'saida' && mov.categoria?.nome) {
        const valor = Number(mov.valor);
        totais[mov.categoria.nome] = (totais[mov.categoria.nome] || 0) + valor;
        totalGeral += valor;
      }
    });

    return Object.entries(totais).map(([nome, total]) => ({
      nome,
      total: formatarMoeda(total),
      percentual: ((total / totalGeral) * 100).toFixed(1)
    }));
  };

  const calcularFluxoCaixa = () => {
    const movimentacoesPeriodo = movimentacoes?.filter(
      mov => new Date(mov.data) >= tresMesesAtras
    );

    let totalEntradas = 0;
    let totalSaidas = 0;

    movimentacoesPeriodo?.forEach(mov => {
      const valor = Number(mov.valor);
      if (mov.tipo === 'entrada') {
        totalEntradas += valor;
      } else {
        totalSaidas += valor;
      }
    });

    return {
      totalEntradas: formatarMoeda(totalEntradas),
      totalSaidas: formatarMoeda(totalSaidas),
      saldoPeriodo: formatarMoeda(totalEntradas - totalSaidas)
    };
  };

  const saldos = calcularSaldoAteData(dataAtual);
  const saldoTotal = Object.values(saldos).reduce((a, b) => a + b, 0);
  const analiseCategoria = calcularTotaisPorCategoria();
  const fluxoCaixa = calcularFluxoCaixa();

  const ultimasMovimentacoes = movimentacoes
    ?.slice(0, 10)
    .map(mov => ({
      data: formatarData(mov.data),
      tipo: mov.tipo,
      conta: mov.conta,
      valor: formatarMoeda(Number(mov.valor)),
      descricao: mov.descricao,
      categoria: mov.categoria?.nome
    }));

  return {
    dataConsulta: formatarData(dataAtual.toISOString()),
    saldos: Object.entries(saldos).map(([conta, valor]) => ({
      conta,
      valor: formatarMoeda(valor)
    })),
    saldoTotal: formatarMoeda(saldoTotal),
    ultimasMovimentacoes,
    analiseCategoria,
    ...fluxoCaixa
  };
}