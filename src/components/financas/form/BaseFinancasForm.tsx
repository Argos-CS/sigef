import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFields } from './FormFields';
import { MovimentacaoTipo } from '@/hooks/useMovimentacoes';
import { UseFormReturn } from 'react-hook-form';
import { Categoria } from '@/hooks/useCategorias';

interface BaseFinancasFormProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  categoriasFiltradas: Categoria[];
  tipoSelecionado: MovimentacaoTipo;
  setTipoSelecionado: (tipo: MovimentacaoTipo) => void;
  formatarCategoria: (categoria: Categoria) => string;
}

export const BaseFinancasForm = ({
  form,
  onSubmit,
  categoriasFiltradas,
  tipoSelecionado,
  setTipoSelecionado,
  formatarCategoria
}: BaseFinancasFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormFields
          control={form.control}
          categoriasFiltradas={categoriasFiltradas}
          tipoSelecionado={tipoSelecionado}
          setTipoSelecionado={setTipoSelecionado}
          formatarCategoria={formatarCategoria}
          form={form}
        />

        <div className="flex justify-end mt-6">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
          >
            Registrar Movimentação
          </Button>
        </div>
      </form>
    </Form>
  );
};