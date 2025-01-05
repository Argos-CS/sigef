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
    console.log('Received query:', query);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todas as movimentações ordenadas por data
    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: false });

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    // Calcular métricas financeiras
    const saldos = {
      Bradesco: 0,
      Cora: 0,
      Dinheiro: 0
    };

    const totais = {
      entradas: 0,
      saidas: 0
    };

    const movimentacoesPorTipo = {
      entrada: [],
      saida: []
    };

    movimentacoes?.forEach(mov => {
      const valor = Number(mov.valor);
      
      // Atualizar saldos por conta
      if (mov.tipo === 'entrada') {
        saldos[mov.conta] += valor;
        totais.entradas += valor;
        movimentacoesPorTipo.entrada.push(mov);
      } else {
        saldos[mov.conta] -= valor;
        totais.saidas += valor;
        movimentacoesPorTipo.saida.push(mov);
      }
    });

    // Preparar últimas movimentações com formatação melhorada
    const ultimasMovimentacoes = movimentacoes
      ?.slice(0, 5)
      .map(mov => ({
        data: new Date(mov.data).toLocaleDateString('pt-BR'),
        tipo: mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1),
        conta: mov.conta,
        valor: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(Number(mov.valor)),
        descricao: mov.descricao
      }));

    // Calcular métricas adicionais
    const saldoTotal = Object.values(saldos).reduce((a, b) => a + b, 0);
    const mediaMovimentacoes = totais.entradas + totais.saidas / (movimentacoes?.length || 1);

    // Preparar contexto financeiro estruturado e formatado
    const financialContext = {
      saldos: Object.entries(saldos).map(([conta, valor]) => ({
        conta,
        valor: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(valor)
      })),
      ultimasMovimentacoes,
      metricas: {
        saldoTotal: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(saldoTotal),
        totalEntradas: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(totais.entradas),
        totalSaidas: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(totais.saidas),
        quantidadeMovimentacoes: movimentacoes?.length || 0,
        mediaMovimentacoes: new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(mediaMovimentacoes)
      }
    };

    console.log('Prepared financial context:', JSON.stringify(financialContext, null, 2));

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
            content: `Você é um assistente financeiro especializado em análise de dados financeiros.
                     Analise cuidadosamente os dados abaixo e forneça respostas diretas e bem estruturadas:

                     📊 RESUMO DOS SALDOS:
                     ${financialContext.saldos
                       .map(({ conta, valor }) => `${conta}: ${valor}`)
                       .join('\n')}

                     📈 MÉTRICAS IMPORTANTES:
                     • Saldo Total: ${financialContext.metricas.saldoTotal}
                     • Total de Entradas: ${financialContext.metricas.totalEntradas}
                     • Total de Saídas: ${financialContext.metricas.totalSaidas}
                     • Quantidade de Movimentações: ${financialContext.metricas.quantidadeMovimentacoes}
                     • Média por Movimentação: ${financialContext.metricas.mediaMovimentacoes}

                     🔄 ÚLTIMAS MOVIMENTAÇÕES:
                     ${financialContext.ultimasMovimentacoes
                       .map(mov => `${mov.data} - ${mov.tipo}: ${mov.valor} (${mov.conta}) - ${mov.descricao}`)
                       .join('\n')}

                     Instruções para respostas:
                     1. Seja direto e objetivo
                     2. Use os dados fornecidos acima para fundamentar suas respostas
                     3. Formate as respostas usando emojis e marcadores para melhor legibilidade
                     4. Se a pergunta for sobre saldos ou movimentações específicas, cite os números exatos
                     5. Sempre responda em português do Brasil
                     6. Se não tiver certeza sobre algo, admita que não tem a informação necessária`
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