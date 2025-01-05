import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received query:', query);
    
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados financeiros
    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: false })
      .limit(100);

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    // Preparar contexto para o GPT
    const financialContext = {
      totalMovimentacoes: movimentacoes?.length,
      movimentacoesRecentes: movimentacoes?.slice(0, 5),
      resumoFinanceiro: movimentacoes?.reduce((acc, mov) => {
        const valor = Number(mov.valor);
        if (mov.tipo === 'entrada') {
          acc.totalEntradas += valor;
        } else {
          acc.totalSaidas += valor;
        }
        return acc;
      }, { totalEntradas: 0, totalSaidas: 0 })
    };

    console.log('Prepared financial context:', JSON.stringify(financialContext, null, 2));

    // Fazer requisição para o GPT
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                     Se necessário, faça cálculos e apresente métricas relevantes.
                     Responda sempre em português do Brasil.`
          },
          {
            role: 'user',
            content: query
          }
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      
      // Check for quota exceeded error
      if (errorData.error?.message?.includes('exceeded your current quota')) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de uso da API excedido. Por favor, entre em contato com o administrador do sistema.',
            type: 'QUOTA_EXCEEDED'
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const gptResponse = await openaiResponse.json();
    console.log('Received GPT response:', gptResponse);

    const answer = gptResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer, context: financialContext }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in financial-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar pergunta: ' + error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});