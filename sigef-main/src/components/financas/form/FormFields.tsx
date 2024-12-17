import { FormRow } from "./FormRow";
import { Control } from "react-hook-form";
import { Movimentacao, MovimentacaoTipo } from "@/hooks/useMovimentacoes";
import { Categoria } from "@/hooks/useCategorias";
import { DateField } from "./fields/DateField";
import { TypeField } from "./fields/TypeField";
import { DescriptionField } from "./fields/DescriptionField";
import { CategoryField } from "./fields/CategoryField";
import { ValueField } from "./fields/ValueField";
import { AccountField } from "./fields/AccountField";
import { useState } from "react";

interface FormFieldsProps {
  control: Control<Movimentacao>;
  categoriasFiltradas: Categoria[];
  tipoSelecionado: MovimentacaoTipo;
  setTipoSelecionado: (tipo: MovimentacaoTipo) => void;
  formatarCategoria: (categoria: Categoria) => string;
  form: any;
}

export const FormFields = ({ 
  control, 
  categoriasFiltradas, 
  tipoSelecionado, 
  setTipoSelecionado,
  formatarCategoria,
  form
}: FormFieldsProps) => {
  const [selectedDescription, setSelectedDescription] = useState<string>();

  return (
    <div className="space-y-6">
      {/* Primeira linha: Data e Tipo */}
      <FormRow>
        <DateField control={control} />
        <TypeField 
          control={control}
          onTypeChange={setTipoSelecionado}
          form={form}
        />
      </FormRow>

      {/* Segunda linha: Descrição e Categoria */}
      <FormRow>
        <DescriptionField
          control={control}
          form={form}
        />
        <CategoryField 
          control={control}
          categoriasFiltradas={categoriasFiltradas}
          formatarCategoria={formatarCategoria}
          form={form}
          selectedDescription={selectedDescription}
        />
      </FormRow>

      {/* Terceira linha: Valor e Conta */}
      <FormRow>
        <ValueField control={control} form={form} />
        <AccountField control={control} />
      </FormRow>
    </div>
  );
};