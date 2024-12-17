import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContaTipo } from '@/hooks/useMovimentacoes';

interface FiltrosMovimentacoesProps {
  filtros: {
    dataInicio: string;
    dataFim: string;
    mes: string;
    ano: string;
    tipo: 'todos' | 'entrada' | 'saida';
    conta: ContaTipo | 'todas';
    descricao: string;
  };
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosMovimentacoesProps['filtros']>>;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
}

const FiltrosMovimentacoes: React.FC<FiltrosMovimentacoesProps> = ({ filtros, setFiltros, aplicarFiltros, limparFiltros }) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="periodo">
        <TabsList>
          <TabsTrigger value="periodo">Por Período</TabsTrigger>
          <TabsTrigger value="mesAno">Por Mês/Ano</TabsTrigger>
          <TabsTrigger value="ano">Por Ano</TabsTrigger>
        </TabsList>
        <TabsContent value="periodo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="Data inicial"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
            />
          </div>
        </TabsContent>
        <TabsContent value="mesAno" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filtros.mes} onValueChange={(value) => setFiltros(prev => ({ ...prev, mes: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Ano"
              value={filtros.ano}
              onChange={(e) => setFiltros(prev => ({ ...prev, ano: e.target.value }))}
            />
          </div>
        </TabsContent>
        <TabsContent value="ano" className="space-y-4">
          <Input
            type="number"
            placeholder="Ano"
            value={filtros.ano}
            onChange={(e) => setFiltros(prev => ({ ...prev, ano: e.target.value }))}
          />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={filtros.tipo} onValueChange={(value: 'todos' | 'entrada' | 'saida') => setFiltros(prev => ({ ...prev, tipo: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtros.conta} onValueChange={(value: ContaTipo | 'todas') => setFiltros(prev => ({ ...prev, conta: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            <SelectItem value="Bradesco">Bradesco</SelectItem>
            <SelectItem value="Cora">Cora</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Filtrar por descrição"
          value={filtros.descricao}
          onChange={(e) => setFiltros(prev => ({ ...prev, descricao: e.target.value }))}
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
        <Button onClick={limparFiltros} variant="outline">Limpar Filtros</Button>
      </div>
    </div>
  );
};

export default FiltrosMovimentacoes;