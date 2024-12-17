import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

interface ImportExportToolsProps {
  onImportSuccess?: () => void;
}

type MovimentacaoInsert = Database['public']['Tables']['movimentacoes']['Insert'];
type ImportLogInsert = Database['public']['Tables']['movimentacoes_import_log']['Insert'];
type ImportLogUpdate = Database['public']['Tables']['movimentacoes_import_log']['Update'];

export const ImportExportTools: React.FC<ImportExportToolsProps> = ({ onImportSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const { data: movimentacoes, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      const ws = XLSX.utils.json_to_sheet(movimentacoes);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Movimentações');
      XLSX.writeFile(wb, 'movimentacoes.xlsx');

      toast({
        title: 'Exportação concluída',
        description: 'Os dados foram exportados com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const importLog: ImportLogInsert = {
        filename: file.name,
        status: 'iniciado',
        user_id: user?.id
      };

      const { error: logError } = await supabase
        .from('movimentacoes_import_log')
        .insert(importLog);

      if (logError) throw logError;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const transformedData: MovimentacaoInsert[] = jsonData.map((row: any) => ({
            data: row.data,
            tipo: row.tipo,
            conta: row.conta,
            descricao: row.descricao,
            valor: parseFloat(row.valor),
            created_by: user?.id,
            categoria_id: row.categoria_id
          }));

          const { error: insertError } = await supabase
            .from('movimentacoes')
            .insert(transformedData);

          if (insertError) throw insertError;

          const updateLog: ImportLogUpdate = {
            status: 'concluido'
          };

          await supabase
            .from('movimentacoes_import_log')
            .update(updateLog)
            .eq('filename', file.name)
            .eq('user_id', user?.id);

          toast({
            title: 'Importação concluída',
            description: 'Os dados foram importados com sucesso.',
          });

          onImportSuccess?.();
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          
          const errorLog: ImportLogUpdate = {
            status: 'erro',
            error_message: error instanceof Error ? error.message : 'Erro desconhecido'
          };
          
          await supabase
            .from('movimentacoes_import_log')
            .update(errorLog)
            .eq('filename', file.name)
            .eq('user_id', user?.id);

          toast({
            title: 'Erro na importação',
            description: 'Não foi possível processar o arquivo.',
            variant: 'destructive',
          });
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={isLoading}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        <Button
          variant="outline"
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
      </div>
    </div>
  );
};