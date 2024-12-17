import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  message: string;
  created_at: string;
  user: {
    nome: string;
    papel: string;
  };
}

interface CommentSectionProps {
  movimentacaoId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ movimentacaoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    subscribeToComments();
  }, [movimentacaoId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('movimentacao_comments')
      .select(`
        id,
        message,
        created_at,
        user:profiles(nome, papel)
      `)
      .eq('movimentacao_id', movimentacaoId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar comentários",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComments(data as unknown as Comment[]);
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'movimentacao_comments',
          filter: `movimentacao_id=eq.${movimentacaoId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('movimentacao_comments')
        .insert([
          {
            movimentacao_id: movimentacaoId,
            user_id: user.id,
            message: newComment.trim()
          }
        ]);

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar comentário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.user.nome}</span>
                <span className="text-sm text-muted-foreground">
                  ({comment.user.papel})
                </span>
              </div>
              <p className="text-sm">{comment.message}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Digite seu comentário..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
};
