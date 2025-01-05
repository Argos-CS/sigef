import { format, parseISO } from 'https://esm.sh/date-fns@2.30.0';
import { ptBR } from 'https://esm.sh/date-fns@2.30.0/locale';

export function prepararContextoFinanceiro(movimentacoes: any[]) {
  const calcularSaldoAteData = (dataFinal: string) => {
    const saldos = {
      Bradesco: 0,
      Cora: 0,
      Dinheiro: 0
    };

    movimentacoes?.forEach(mov => {
      if (mov.data <= dataFinal) {
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

  const dataAtual = new Date().toISOString().split('T')[0];
  const saldos = calcularSaldoAteData(dataAtual);
  const saldoTotal = Object.values(saldos).reduce((a, b) => a + b, 0);

  const ultimasMovimentacoes = movimentacoes
    ?.slice(-5)
    .map(mov => ({
      data: formatarData(mov.data),
      tipo: mov.tipo,
      conta: mov.conta,
      valor: formatarMoeda(Number(mov.valor)),
      descricao: mov.descricao
    }));

  return {
    dataConsulta: formatarData(dataAtual),
    saldos: Object.entries(saldos).map(([conta, valor]) => ({
      conta,
      valor: formatarMoeda(valor)
    })),
    saldoTotal: formatarMoeda(saldoTotal),
    ultimasMovimentacoes
  };
}