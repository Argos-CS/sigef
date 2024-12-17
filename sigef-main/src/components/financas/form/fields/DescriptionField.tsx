import { FormSection } from "../FormSection";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";
import { Input } from "@/components/ui/input";

interface DescriptionFieldProps {
  control: Control<Movimentacao>;
  form: any;
}

export const DescriptionField = ({ 
  control, 
  form
}: DescriptionFieldProps) => {
  return (
    <FormSection control={control} name="descricao" label="Descrição">
      {(field) => (
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Digite uma descrição..."
            className="w-full"
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={(e) => {
              field.onChange(e.target.value);
              form.setValue('descricao', e.target.value);
            }}
          />
        </div>
      )}
    </FormSection>
  );
};