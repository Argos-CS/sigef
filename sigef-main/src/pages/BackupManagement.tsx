import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { Navigate } from 'react-router-dom';

const BackupManagement: React.FC = () => {
  const { user, canManageUsers } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers()) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-600">
              Apenas administradores podem gerenciar backups do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateBackup = async () => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-backup', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Create a blob from the backup data and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Backup gerado com sucesso",
        description: "O download do arquivo de backup começará automaticamente.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const backupData = JSON.parse(e.target?.result as string);
        
        const { error } = await supabase.functions.invoke('restore-backup', {
          body: { 
            userId: user.id,
            backupData 
          }
        });

        if (error) throw error;

        toast({
          title: "Backup restaurado com sucesso",
          description: "O sistema foi restaurado com sucesso a partir do backup.",
        });
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Erro ao restaurar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Gerenciamento de Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-sm text-yellow-700">
                  <strong>Atenção:</strong> O processo de backup e restauração afeta todo o sistema.
                  Certifique-se de realizar essas operações em momentos de baixo uso do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Gerar Backup</h3>
              <p className="text-sm text-gray-600 mb-2">
                Faça o download de um backup completo do sistema. Este arquivo conterá todos os dados necessários para uma restauração completa.
              </p>
              <Button
                onClick={handleGenerateBackup}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  "Gerando backup..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar e Baixar Backup
                  </>
                )}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Restaurar Backup</h3>
              <p className="text-sm text-gray-600 mb-2">
                Restaure o sistema a partir de um arquivo de backup previamente gerado.
                Esta operação substituirá os dados atuais do sistema.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  disabled={isRestoring}
                  ref={fileInputRef}
                  className="hidden"
                  id="backup-file"
                />
                <Button
                  onClick={() => document.getElementById('backup-file')?.click()}
                  disabled={isRestoring}
                  className="w-full sm:w-auto"
                >
                  {isRestoring ? (
                    "Restaurando backup..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar e Restaurar Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;