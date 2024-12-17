import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { User } from '@/contexts/auth/types';

interface DeleteUserDialogProps {
  user: User | null;
  onOpenChange: () => void;
  onConfirm: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ user, onOpenChange, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase.rpc('toggle_user_status', {
        user_id_param: user.id,
        new_status: 'desativado'
      });

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
      
      onConfirm();
      onOpenChange();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h2>Excluir Usuário</h2>
      <p>Tem certeza que deseja excluir este usuário?</p>
      <div>
        <Button onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
        </Button>
        <Button onClick={onOpenChange}>Cancelar</Button>
      </div>
    </div>
  );
};

export default DeleteUserDialog;