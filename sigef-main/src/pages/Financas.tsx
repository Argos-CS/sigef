import React from 'react';
import { Link } from 'react-router-dom';
import FinancasForm from '@/components/FinancasForm';
import MovimentacoesTable from '@/components/MovimentacoesTable';
import { ImportExportTools } from '@/components/financas/ImportExportTools';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useToast } from '@/hooks/use-toast';
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { Button } from '@/components/ui/button';
import { ArrowRight, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Financas = () => {
  const { movimentacoes, addMovimentacao, updateMovimentacao, deleteMovimentacao } = useMovimentacoes();
  const { toast } = useToast();

  // Get only the 10 most recent transactions
  const recentMovimentacoes = [...movimentacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10);

  const handleSubmit = async (values: Omit<Movimentacao, 'id' | 'created_by' | 'is_approved'>) => {
    try {
      await addMovimentacao(values);
      toast({
        title: "Sucesso!",
        description: "Movimentação registrada com sucesso",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (id: string, movimentacao: Movimentacao) => {
    try {
      await updateMovimentacao(id, movimentacao);
      toast({
        title: "Sucesso",
        description: "Movimentação atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar movimentação",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMovimentacao(id);
      toast({
        title: "Sucesso",
        description: "Movimentação excluída com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir movimentação",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Gestão Financeira
        </h1>
        <ImportExportTools />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Registro Rápido</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Registre suas movimentações financeiras de forma rápida e organizada
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Acompanhamento</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todas as suas movimentações em um só lugar
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Controle Total</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mantenha o controle completo das suas finanças com facilidade
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8">
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-6">Nova Movimentação</h2>
          <FinancasForm onSubmit={handleSubmit} />
        </div>
        
        <div className="glass p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Últimas Movimentações</h2>
            <Button variant="link" asChild>
              <Link to="/relatorios" className="flex items-center hover:text-primary transition-colors">
                Ver todas as movimentações
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <MovimentacoesTable 
            movimentacoes={recentMovimentacoes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Financas;