import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { Loader2, AlertTriangle } from "lucide-react";

interface Message {
  role: 'user' | 'assistant' | 'error';
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
      
      console.log('Enviando consulta para o assistente financeiro:', input);
      
      const { data, error } = await supabase.functions.invoke('financial-assistant', {
        body: { query: input }
      });

      console.log('Resposta do assistente financeiro:', { data, error });

      if (error) {
        console.error('Erro na função do Supabase:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.answer) {
        throw new Error('Resposta inválida do assistente');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      setInput('');
    } catch (error) {
      console.error('Erro ao processar pergunta:', error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: error.message || "Não foi possível obter uma resposta do assistente."
      }]);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível processar sua pergunta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Assistente Financeiro (Grok)</CardTitle>
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
                {message.role === 'error' ? (
                  <Alert variant="destructive" className="max-w-[80%]">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{message.content}</AlertDescription>
                  </Alert>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Faça uma pergunta sobre os dados financeiros..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};