import { FormSection } from "../FormSection";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface ValueFieldProps {
  control: Control<Movimentacao>;
  form: any;
}

export const ValueField = ({ control, form }: ValueFieldProps) => {
  return (
    <FormSection control={control} name="valor" label="Valor">
      {(field) => (
        <Input
          type="number"
          step="0.01"
          {...field}
          value={field.value as string}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value);
            form.setValue('valor', value);
          }}
        />
      )}
    </FormSection>
  );
};