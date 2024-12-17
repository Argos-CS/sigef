import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { User } from '@/contexts/auth/types';
import { useAuth } from '@/contexts/AuthContext';
import { UserFormFields } from './UserFormFields';

const editUserSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  papel: z.enum(['admin', 'tesoureiro', 'assistente', 'auditor'] as const),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6).optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ 
  user, 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        nome: user.nome,
        papel: user.papel,
        email: user.email,
      });
    }
  }, [user]);

  const onSubmit = async (data: EditUserFormValues) => {
    if (!user) return;

    try {
      const isAdmin = currentUser?.papel === 'admin';
      const isOwnProfile = currentUser?.id === user.id;

      if (!isAdmin && !isOwnProfile) {
        throw new Error('Você não tem permissão para editar este perfil');
      }

      const updateData: any = {
        nome: data.nome,
        email: data.email,
      };

      if (isAdmin) {
        updateData.papel = data.papel;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (data.password && isAdmin) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: data.password }
        );
        if (passwordError) throw passwordError;
      }

      toast({
        title: "Usuário atualizado com sucesso",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UserFormFields form={form} />
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};