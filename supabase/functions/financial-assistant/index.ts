import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados financeiros
    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: false });

    if (movError) throw movError;

    // Preparar contexto para o GPT
    const financialContext = {
      totalMovimentacoes: movimentacoes.length,
      movimentacoesRecentes: movimentacoes.slice(0, 5),
      resumoFinanceiro: movimentacoes.reduce((acc, mov) => {
        if (mov.tipo === 'entrada') {
          acc.totalEntradas += Number(mov.valor);
        } else {
          acc.totalSaidas += Number(mov.valor);
        }
        return acc;
      }, { totalEntradas: 0, totalSaidas: 0 })
    };

    // Fazer requisição para o GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente financeiro especializado em análise de dados. 
                     Você tem acesso aos seguintes dados financeiros:
                     ${JSON.stringify(financialContext, null, 2)}
                     
                     Responda de forma clara e profissional, usando os dados disponíveis para fundamentar suas análises.
                     Se necessário, faça cálculos e apresente métricas relevantes.`
          },
          {
            role: 'user',
            content: query
          }
        ],
      }),
    });

    const gptResponse = await response.json();
    const answer = gptResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer, context: financialContext }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});