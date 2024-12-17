import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Movimentacao } from '@/hooks/useMovimentacoes';
import { CommentSection } from '../comments/CommentSection';

interface TableActionsProps {
  movimentacao: Movimentacao;
  canEdit: boolean;
  canDelete: boolean;
  canViewComments: boolean;
  onEdit: (id: string, movimentacao: Movimentacao) => void;
  onDelete: (id: string) => void;
  selectedMovimentacao: string | null;
  setSelectedMovimentacao: (id: string | null) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  movimentacao,
  canEdit,
  canDelete,
  canViewComments,
  onEdit,
  onDelete,
  selectedMovimentacao,
  setSelectedMovimentacao
}) => {
  return (
    <div className="flex space-x-2">
      {canEdit && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(movimentacao.id, movimentacao)}
          className="hover:bg-blue-50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {canDelete && (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-red-50"
              disabled={movimentacao.is_approved}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta movimentação?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onDelete(movimentacao.id)}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {canViewComments && (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedMovimentacao(movimentacao.id)}
              className="hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comentários</DialogTitle>
            </DialogHeader>
            {selectedMovimentacao && (
              <CommentSection movimentacaoId={selectedMovimentacao} />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};