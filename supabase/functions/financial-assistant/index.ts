import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { format, parseISO } from 'https://esm.sh/date-fns@2.30.0';
import { ptBR } from 'https://esm.sh/date-fns@2.30.0/locale';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, model = 'groq' } = await req.json();
    console.log('Received query:', query, 'using model:', model);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar movimentações
    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: true });

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    // Preparar contexto financeiro
    const contextoFinanceiro = prepararContextoFinanceiro(movimentacoes);
    console.log('Prepared financial context:', JSON.stringify(contextoFinanceiro, null, 2));

    let answer;
    if (model === 'grok') {
      answer = await callGrokAPI(query, contextoFinanceiro);
    } else {
      answer = await callGroqAPI(query, contextoFinanceiro);
    }

    return new Response(
      JSON.stringify({ answer, context: contextoFinanceiro }),
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

function prepararContextoFinanceiro(movimentacoes: any[]) {
  const calcularSaldoAteData = (dataFinal: string) => {
    const saldos = {
      Bradesco: 0,
      Cora: 0,
      Dinheiro: 0
    };

    movimentacoes?.forEach(mov => {
      if (mov.data <= dataFinal) {
        const valor = Number(mov.valor);
        if (mov.tipo === 'entrada') {
          saldos[mov.conta] += valor;
        } else {
          saldos[mov.conta] -= valor;
        }
      }
    });

    return saldos;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const dataAtual = new Date().toISOString().split('T')[0];
  const saldos = calcularSaldoAteData(dataAtual);
  const saldoTotal = Object.values(saldos).reduce((a, b) => a + b, 0);

  // Encontrar últimas 5 movimentações
  const ultimasMovimentacoes = movimentacoes
    ?.slice(-5)
    .map(mov => ({
      data: formatarData(mov.data),
      tipo: mov.tipo,
      conta: mov.conta,
      valor: formatarMoeda(Number(mov.valor)),
      descricao: mov.descricao
    }));

  return {
    dataConsulta: formatarData(dataAtual),
    saldos: Object.entries(saldos).map(([conta, valor]) => ({
      conta,
      valor: formatarMoeda(valor)
    })),
    saldoTotal: formatarMoeda(saldoTotal),
    ultimasMovimentacoes
  };
}

async function callGroqAPI(query: string, contextoFinanceiro: any) {
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
          content: getSystemPrompt(contextoFinanceiro)
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
  return gptResponse.choices[0].message.content;
}

async function callGrokAPI(query: string, contextoFinanceiro: any) {
  const grokResponse = await fetch('https://api.grok.x/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('GROK_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(contextoFinanceiro)
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

  if (!grokResponse.ok) {
    const errorData = await grokResponse.json();
    console.error('Grok API error:', errorData);
    throw new Error(`Grok API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const grokResult = await grokResponse.json();
  return grokResult.choices[0].message.content;
}

function getSystemPrompt(contextoFinanceiro: any) {
  return `Você é um assistente financeiro especializado em análise de dados financeiros.
         Analise os dados fornecidos e responda de forma clara e estruturada, seguindo estas diretrizes:

         1. Use emojis relevantes para tornar a resposta mais amigável
         2. Estruture a resposta em seções claras com títulos em negrito
         3. Sempre formate valores monetários adequadamente
         4. Seja direto e objetivo nas respostas
         5. Se a pergunta envolver uma data específica, confirme a data na resposta
         6. Se não houver dados suficientes, explique claramente o motivo
         7. Use tabelas quando apropriado para melhor visualização dos dados
         8. Destaque informações importantes em negrito
         9. Separe claramente diferentes seções da resposta
         10. Forneça um resumo conciso no início da resposta

         Dados disponíveis para análise:
         
         📅 Data da Consulta: ${contextoFinanceiro.dataConsulta}

         💰 Saldos por Conta:
         ${contextoFinanceiro.saldos.map(s => `${s.conta}: ${s.valor}`).join('\n')}

         🏦 Saldo Total: ${contextoFinanceiro.saldoTotal}

         📝 Últimas Movimentações:
         ${contextoFinanceiro.ultimasMovimentacoes
           .map(m => `${m.data} - ${m.tipo}: ${m.valor} (${m.conta}) - ${m.descricao}`)
           .join('\n')}
         `;
}