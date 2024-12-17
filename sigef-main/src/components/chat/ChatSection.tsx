import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    nome: string;
    papel: string;
  };
}

export const ChatSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        message,
        created_at,
        user_id,
        user:profiles(id, nome, papel)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const formattedMessages = data.map(msg => ({
        ...msg,
        user: msg.user[0] as ChatMessage['user']
      }));
      setMessages(formattedMessages);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ message, user_id: user.id }]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chat da Equipe</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollRef} className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                created_at={msg.created_at}
                user={msg.user}
                currentUserId={user?.id || ''}
              />
            ))}
          </div>
        </ScrollArea>
        <ChatInput onSendMessage={sendMessage} />
      </CardContent>
    </Card>
  );
};