import { FormSection } from "../FormSection";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/types/movimentacao";

interface DateFieldProps {
  control: Control<Movimentacao>;
}

export const DateField = ({ control }: DateFieldProps) => {
  return (
    <FormSection control={control} name="data" label="Data">
      {(field) => (
        <Input 
          type="date" 
          {...field} 
          value={field.value as string}
          name={field.name.toString()}
        />
      )}
    </FormSection>
  );
};