import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { FormCard } from "./FormCard";
import { ReactNode } from "react";
import { Control, ControllerRenderProps } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface FormSectionProps {
  control: Control<Movimentacao>;
  name: keyof Movimentacao;
  label: string;
  children: (field: ControllerRenderProps<Movimentacao, keyof Movimentacao>) => ReactNode;
}

export const FormSection = ({ control, name, label, children }: FormSectionProps) => {
  return (
    <FormCard>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">{label}</FormLabel>
            <FormControl>{children(field)}</FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormCard>
  );
};