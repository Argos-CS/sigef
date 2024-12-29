import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Filter } from 'lucide-react';

interface DashboardFiltersProps {
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
  dateRange,
  setDateRange,
  onReset
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};

export default DashboardFilters;