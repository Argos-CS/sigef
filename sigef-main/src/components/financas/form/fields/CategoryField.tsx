import { FormSection } from "../FormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { Movimentacao } from "@/hooks/useMovimentacoes";
import { Label } from "@/components/ui/label";
import { Categoria } from "@/hooks/useCategorias";
import { useEffect } from "react";

interface CategoryFieldProps {
  control: Control<Movimentacao>;
  categoriasFiltradas: Categoria[];
  formatarCategoria: (categoria: Categoria) => string;
  form: any;
  selectedDescription?: string;
}

export const CategoryField = ({ 
  control, 
  categoriasFiltradas, 
  formatarCategoria,
  form,
  selectedDescription 
}: CategoryFieldProps) => {
  const secundariaCategorias = categoriasFiltradas.filter(cat => cat.nivel === 'secundaria');
  
  // Efeito para auto-preencher a categoria quando uma descrição é selecionada
  useEffect(() => {
    if (selectedDescription) {
      const terciaria = categoriasFiltradas.find(cat => 
        cat.nivel === 'terciaria' && cat.nome === selectedDescription
      );
      
      if (terciaria) {
        const secundaria = categoriasFiltradas.find(cat => 
          cat.id === terciaria.categoria_pai_id
        );
        
        if (secundaria) {
          form.setValue('categoria_id', secundaria.id);
        }
      }
    }
  }, [selectedDescription, categoriasFiltradas, form]);

  return (
    <div className="space-y-2 w-full">
      <Label className="text-base font-medium">Categoria</Label>
      <FormSection control={control} name="categoria_id" label="">
        {(field) => (
          <Select 
            onValueChange={field.onChange} 
            value={field.value as string}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {secundariaCategorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormSection>
    </div>
  );
};