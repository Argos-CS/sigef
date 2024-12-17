import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/auth/types';

const userSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  papel: z.enum(['admin', 'tesoureiro', 'assistente', 'auditor'] as const),
});

type UserFormValues = z.infer<typeof userSchema>;

export const UserRegistrationForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      nome: '',
      password: '',
      papel: 'auditor',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (isSubmitting || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            papel: data.papel,
          },
        },
      });

      if (signUpError) throw signUpError;

      form.reset({
        email: '',
        nome: '',
        password: '',
        papel: 'auditor',
      });
      
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `O usuário ${data.email} foi criado com o papel de ${data.papel}`,
      });

    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message === 'Password should be at least 6 characters' 
          ? 'A senha deve ter pelo menos 6 caracteres'
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@exemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="******" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="papel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Papel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="tesoureiro">Tesoureiro</SelectItem>
                  <SelectItem value="assistente">Assistente</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar Usuário"}
        </Button>
      </form>
    </Form>
  );
};