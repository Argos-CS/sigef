import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from '@/contexts/auth/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface ToggleUserStatusDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ToggleUserStatusDialog: React.FC<ToggleUserStatusDialogProps> = ({
  user,
  onOpenChange,
  onConfirm,
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const newStatus = user.status === 'ativo' ? 'desativado' : 'ativo';
      const { error } = await supabase
        .rpc('toggle_user_status', {
          user_id_param: user.id,
          new_status: newStatus
        });
      
      if (error) throw error;

      toast({
        title: "Status atualizado com sucesso",
        description: `O usuário foi ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      onConfirm();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      onOpenChange(false);
    }
  };

  const newStatus = user?.status === 'ativo' ? 'desativar' : 'ativar';

  return (
    <AlertDialog open={!!user} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja {newStatus} o usuário {user?.nome}?
            {user?.status === 'ativo' 
              ? ' O usuário não poderá mais acessar o sistema, mas seus dados serão mantidos.'
              : ' O usuário poderá voltar a acessar o sistema normalmente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleToggleStatus} 
            className={user?.status === 'ativo' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
            disabled={isUpdating}
          >
            {isUpdating ? "Atualizando..." : `Confirmar ${newStatus}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};