import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportarParaExcel, importarDoExcel } from "@/utils/excel";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { Movimentacao } from "@/types/movimentacao";

export function MovimentacoesActions() {
  const { toast } = useToast();
  const { movimentacoes, addMovimentacao } = useMovimentacoes();

  const handleExport = async () => {
    try {
      await exportarParaExcel(movimentacoes, 'movimentacoes');
      toast({
        title: "Exportação concluída",
        description: "Suas movimentações foram exportadas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar suas movimentações.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const movimentacoesImportadas = await importarDoExcel(file);
      
      for (const mov of movimentacoesImportadas) {
        const { id, created_at, updated_at, is_approved, ...movimentacaoData } = mov;
        await addMovimentacao(movimentacaoData);
      }

      toast({
        title: "Importação concluída",
        description: `${movimentacoesImportadas.length} movimentações foram importadas com sucesso!`,
      });

      event.target.value = '';
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar as movimentações. Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleExport}
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </div>
    </div>
  );
}