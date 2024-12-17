import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from '@/contexts/auth/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

const contactInfoSchema = z.object({
  email: z.string().email({ message: "Email de recuperação inválido" }),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

interface ContactInfoFormProps {
  user: User;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ user }) => {
  const { toast } = useToast();

  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: user.email,
      nome: user.nome,
    },
  });

  const onSubmit = async (data: ContactInfoFormValues) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: data.email,
          nome: data.nome,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Informações atualizadas",
        description: "Suas informações de contato foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar informações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit"
          className="w-full"
        >
          Atualizar Informações
        </Button>
      </form>
    </Form>
  );
};

export default ContactInfoForm;