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

    // Buscar movimentações mais recentes primeiro
    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: false });

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    // Calcular saldos por conta
    const saldos: Record<string, number> = {
      Bradesco: 0,
      Cora: 0,
      Dinheiro: 0
    };

    movimentacoes?.forEach(mov => {
      const valor = Number(mov.valor);
      if (mov.tipo === 'entrada') {
        saldos[mov.conta] += valor;
      } else {
        saldos[mov.conta] -= valor;
      }
    });

    // Preparar resumo das últimas movimentações
    const ultimasMovimentacoes = movimentacoes
      ?.slice(0, 5)
      .map(mov => ({
        data: mov.data,
        tipo: mov.tipo,
        conta: mov.conta,
        valor: Number(mov.valor),
        descricao: mov.descricao
      }));

    // Preparar contexto financeiro estruturado
    const financialContext = {
      saldosAtuais: saldos,
      ultimasMovimentacoes,
      resumoGeral: {
        totalContas: Object.values(saldos).reduce((a, b) => a + b, 0),
        quantidadeMovimentacoes: movimentacoes?.length || 0
      }
    };

    console.log('Prepared financial context:', JSON.stringify(financialContext, null, 2));

    // Fazer requisição para a Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente financeiro especializado em análise de dados.
                     Você tem acesso aos seguintes dados financeiros atualizados:
                     
                     SALDOS ATUAIS:
                     ${Object.entries(saldos)
                       .map(([conta, valor]) => `${conta}: R$ ${valor.toFixed(2)}`)
                       .join('\n')}
                     
                     ÚLTIMAS MOVIMENTAÇÕES:
                     ${ultimasMovimentacoes
                       ?.map(mov => 
                         `${mov.data}: ${mov.tipo} de R$ ${mov.valor.toFixed(2)} em ${mov.conta} - ${mov.descricao}`)
                       .join('\n')}
                     
                     RESUMO GERAL:
                     - Total em todas as contas: R$ ${financialContext.resumoGeral.totalContas.toFixed(2)}
                     - Quantidade total de movimentações: ${financialContext.resumoGeral.quantidadeMovimentacoes}
                     
                     Responda de forma direta e objetiva, usando os dados acima.
                     Se a pergunta for sobre saldos ou movimentações, use os dados fornecidos.
                     Responda sempre em português do Brasil.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const gptResponse = await groqResponse.json();
    console.log('Received Groq response:', gptResponse);

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