import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const FinancialAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      
      const { data, error } = await supabase.functions.invoke('financial-assistant', {
        body: { query: input }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao processar pergunta",
        description: "Não foi possível obter uma resposta do assistente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Assistente Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta sobre os dados financeiros..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};