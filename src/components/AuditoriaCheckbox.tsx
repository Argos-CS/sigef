import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AuditStatus, MovimentacaoAudit } from '@/types/audit';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AuditoriaCheckboxProps {
  movimentacaoId: string;
}

export const AuditoriaCheckbox: React.FC<AuditoriaCheckboxProps> = ({ movimentacaoId }) => {
  const { user, canAuditFinances } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<AuditStatus>('pendente');
  const [comentario, setComentario] = useState('');
  const [auditoria, setAuditoria] = useState<MovimentacaoAudit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditoria();
  }, [movimentacaoId]);

  const fetchAuditoria = async () => {
    try {
      setIsLoading(true);
      console.log('Buscando auditoria para movimentação:', movimentacaoId);
      
      const { data, error } = await supabase
        .from('movimentacoes_audit')
        .select('*')
        .eq('movimentacao_id', movimentacaoId);

      if (error) {
        console.error('Erro ao buscar auditoria:', error);
        return;
      }

      if (data && data.length > 0) {
        const auditData = {
          ...data[0],
          status: data[0].status as AuditStatus
        };
        console.log('Auditoria encontrada:', auditData);
        setAuditoria(auditData);
        setStatus(auditData.status);
        setComentario(auditData.comentario || '');
      } else {
        console.log('Nenhuma auditoria encontrada para a movimentação');
        setAuditoria(null);
        setStatus('pendente');
        setComentario('');
      }
    } catch (error) {
      console.error('Erro ao buscar auditoria:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditoria = async () => {
    if (!user) return;

    try {
      const auditData = {
        movimentacao_id: movimentacaoId,
        auditor_id: user.id,
        status,
        comentario,
      };

      console.log('Salvando auditoria:', auditData);

      const { error } = auditoria
        ? await supabase
            .from('movimentacoes_audit')
            .update(auditData)
            .eq('id', auditoria.id)
        : await supabase
            .from('movimentacoes_audit')
            .insert([auditData]);

      if (error) throw error;

      toast({
        title: "Auditoria registrada",
        description: `O status da movimentação foi atualizado para ${status}.`,
      });

      setIsDialogOpen(false);
      fetchAuditoria();
    } catch (error: any) {
      console.error('Erro ao salvar auditoria:', error);
      toast({
        title: "Erro ao registrar auditoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    const variants = {
      aprovado: {
        className: "bg-green-500 hover:bg-green-600",
        icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
      },
      reprovado: {
        className: "bg-red-500 hover:bg-red-600",
        icon: <XCircle className="h-4 w-4 mr-1" />,
      },
      pendente: {
        className: "bg-yellow-500 hover:bg-yellow-600",
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
      },
    };

    const { className, icon } = variants[status];

    return (
      <Badge 
        className={`${className} flex items-center cursor-help`}
        onClick={() => auditoria?.comentario && toast({
          title: "Comentário da Auditoria",
          description: auditoria.comentario,
        })}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center animate-pulse">
        <AlertCircle className="h-4 w-4 mr-1" />
        Carregando...
      </Badge>
    );
  }

  if (!canAuditFinances() && !auditoria) {
    return (
      <Badge variant="secondary" className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        Pendente
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {canAuditFinances() && !auditoria?.status ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Auditar
        </Button>
      ) : (
        getStatusBadge()
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auditoria da Movimentação</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="status" className="min-w-[80px]">Status:</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AuditStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentario">Comentário:</Label>
              <Textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Adicione um comentário sobre a auditoria..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAuditoria}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};