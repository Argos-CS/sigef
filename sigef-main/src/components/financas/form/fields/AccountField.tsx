import { FormSection } from "../FormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface AccountFieldProps {
  control: Control<Movimentacao>;
}

export const AccountField = ({ control }: AccountFieldProps) => {
  return (
    <FormSection control={control} name="conta" label="Conta">
      {(field) => (
        <Select 
          onValueChange={field.onChange} 
          value={field.value as string}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            <SelectItem value="Bradesco">Bradesco</SelectItem>
            <SelectItem value="Cora">Cora</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormSection>
  );
};