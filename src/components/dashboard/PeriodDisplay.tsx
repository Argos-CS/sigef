import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PeriodDisplayProps {
  timeRange: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const PeriodDisplay = ({ timeRange, dateRange }: PeriodDisplayProps) => {
  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getPeriodoFormatado = () => {
    try {
      if (timeRange === 'custom' && dateRange.from && dateRange.to) {
        return `${formatDate(dateRange.from)} até ${formatDate(dateRange.to)}`;
      }

      const hoje = new Date();
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - Number(timeRange));
      
      return `${formatDate(inicio)} até ${formatDate(hoje)}`;
    } catch (error) {
      console.error('Erro ao formatar período:', error);
      return 'Período não definido';
    }
  };

  return (
    <div className="p-4 rounded-xl">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">Período selecionado</h2>
          <p className="text-lg font-medium">{getPeriodoFormatado()}</p>
        </div>
      </div>
    </div>
  );
};