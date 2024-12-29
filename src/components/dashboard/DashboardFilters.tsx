import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Filter } from 'lucide-react';

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
  onReset: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  timeRange,
  setTimeRange,
  dateRange,
  setDateRange,
  onReset
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>Limpar Filtros</Button>
      </div>
    </div>
  );
};

export default DashboardFilters;