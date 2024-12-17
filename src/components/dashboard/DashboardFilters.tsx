import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface DashboardFiltersProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  conta: string;
  setConta: (value: string) => void;
  tipo: string;
  setTipo: (value: string) => void;
  onReset: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  timeRange,
  setTimeRange,
  dateRange,
  setDateRange,
  conta,
  setConta,
  tipo,
  setTipo,
  onReset
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodo">Período</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="periodo">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {timeRange === 'custom' && (
          <>
            <div className="space-y-2">
              <Label>Data inicial</Label>
              <DatePicker
                selected={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                placeholder="Selecione a data inicial"
              />
            </div>
            <div className="space-y-2">
              <Label>Data final</Label>
              <DatePicker
                selected={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                placeholder="Selecione a data final"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="conta">Conta</Label>
          <Select value={conta} onValueChange={setConta}>
            <SelectTrigger id="conta">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Bradesco">Bradesco</SelectItem>
              <SelectItem value="Cora">Cora</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>Limpar Filtros</Button>
      </div>
    </div>
  );
};

export default DashboardFilters;