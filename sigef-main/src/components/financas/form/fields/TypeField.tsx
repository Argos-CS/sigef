import { FormSection } from "../FormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovimentacaoTipo } from "@/hooks/useMovimentacoes";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface TypeFieldProps {
  control: Control<Movimentacao>;
  onTypeChange: (value: MovimentacaoTipo) => void;
  form: any;
}

export const TypeField = ({ control, onTypeChange, form }: TypeFieldProps) => {
  return (
    <FormSection control={control} name="tipo" label="Tipo">
      {(field) => (
        <Select 
          onValueChange={(value: MovimentacaoTipo) => {
            field.onChange(value);
            onTypeChange(value);
            form.setValue('categoria_id', '');
            form.setValue('descricao', '');
          }} 
          defaultValue="saida"
          value={field.value as string}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormSection>
  );
};