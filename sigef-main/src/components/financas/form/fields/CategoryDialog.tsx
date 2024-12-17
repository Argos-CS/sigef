import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Categoria } from "@/hooks/useCategorias";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  descricaoValue: string;
  selectedParentCategory: string;
  setSelectedParentCategory: (value: string) => void;
  handleSaveNewCategory: () => void;
  categoriasFiltradas: Categoria[];
  formatarCategoria: (categoria: Categoria) => string;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  descricaoValue,
  selectedParentCategory,
  setSelectedParentCategory,
  handleSaveNewCategory,
  categoriasFiltradas,
  formatarCategoria
}: CategoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Selecione a categoria pai para adicionar "{descricaoValue}" como uma nova categoria terciária.
          </DialogDescription>
        </DialogHeader>
        
        <Select onValueChange={setSelectedParentCategory} value={selectedParentCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria pai" />
          </SelectTrigger>
          <SelectContent>
            {categoriasFiltradas
              .filter(cat => cat.nivel === 'secundaria')
              .map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {formatarCategoria(categoria)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveNewCategory}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};