import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Movimentacao, MovimentacaoTipo } from '@/hooks/useMovimentacoes';
import { useToast } from "@/hooks/use-toast";
import { useCategorias } from '@/hooks/useCategorias';
import { BaseFinancasForm } from './financas/form/BaseFinancasForm';

type FormValues = {
  id?: string;
  data: string;
  tipo: MovimentacaoTipo;
  descricao: string;
  valor: string;
  conta: 'Dinheiro' | 'Bradesco' | 'Cora';
  categoria_id?: string;
  created_by?: string;
  is_approved?: boolean;
};

const formSchema = z.object({
  data: z.string().min(1, { message: 'Data é obrigatória' }),
  tipo: z.enum(['entrada', 'saida'] as const, { required_error: 'Tipo é obrigatório' }),
  descricao: z.string().min(1, { message: 'Descrição é obrigatória' }),
  valor: z.string().min(1, { message: 'Valor é obrigatório' }).refine((val) => !isNaN(Number(val)), { message: 'Valor deve ser um número' }),
  conta: z.enum(['Dinheiro', 'Bradesco', 'Cora'] as const, { required_error: 'Conta é obrigatória' }),
  categoria_id: z.string().optional(),
});

interface FinancasFormProps {
  onSubmit: (values: Movimentacao) => void;
  initialValues?: Movimentacao;
}

const FinancasForm: React.FC<FinancasFormProps> = ({ onSubmit, initialValues }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<MovimentacaoTipo>(initialValues?.tipo || 'saida');
  const { toast } = useToast();
  const { categoriasFiltradas, formatarCategoria } = useCategorias(tipoSelecionado);

  const defaultValues = {
    data: initialValues?.data || new Date().toISOString().split('T')[0],
    tipo: initialValues?.tipo || 'saida',
    descricao: initialValues?.descricao || '',
    valor: initialValues?.valor || '',
    conta: initialValues?.conta || 'Dinheiro',
    categoria_id: initialValues?.categoria_id || '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values as unknown as Movimentacao);
      toast({
        title: "Sucesso!",
        description: "Movimentação registrada com sucesso",
        duration: 3000,
      });
      form.reset(defaultValues);
      setTipoSelecionado('saida');
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseFinancasForm
      form={form}
      onSubmit={handleSubmit}
      categoriasFiltradas={categoriasFiltradas}
      tipoSelecionado={tipoSelecionado}
      setTipoSelecionado={setTipoSelecionado}
      formatarCategoria={formatarCategoria}
    />
  );
};

export default FinancasForm;