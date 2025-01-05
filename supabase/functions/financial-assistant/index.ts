import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/cors.ts';
import { prepararContextoFinanceiro } from './utils/context.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Recebida consulta:', query);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select(`
        *,
        categoria:categorias_plano_contas(
          id,
          nome,
          codigo,
          tipo
        )
      `)
      .order('data', { ascending: false });

    if (movError) {
      console.error('Erro ao buscar movimentações:', movError);
      throw movError;
    }

    console.log('Total de movimentações recuperadas:', movimentacoes?.length);

    const contextoFinanceiro = prepararContextoFinanceiro(movimentacoes);
    console.log('Contexto financeiro preparado:', JSON.stringify(contextoFinanceiro, null, 2));

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    console.log('Enviando requisição para API Groq...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente financeiro especializado em análise de dados financeiros corporativos.
                     Analise os dados fornecidos e responda de forma estruturada e objetiva, seguindo estas diretrizes:

                     1. Seja direto e objetivo, evitando explicações desnecessárias
                     2. Use formatação em negrito para destacar valores e informações importantes
                     3. Formate valores monetários sempre com R$ e duas casas decimais
                     4. Se a pergunta envolver datas, confirme-as na resposta
                     5. Se faltar dados, explique claramente o que está faltando
                     6. Use tabelas quando ajudar na visualização dos dados
                     7. Forneça um resumo conciso no início
                     8. Ao analisar tendências, compare com períodos anteriores
                     9. Destaque variações significativas nos dados
                     10. Sugira ações baseadas nos dados quando relevante

                     Dados disponíveis para análise:
                     
                     📊 Data da Análise: ${contextoFinanceiro.dataConsulta}

                     💰 Saldos Atuais por Conta:
                     ${contextoFinanceiro.saldos.map(s => `${s.conta}: ${s.valor}`).join('\n')}

                     💵 Saldo Total: ${contextoFinanceiro.saldoTotal}

                     📝 Últimas Movimentações:
                     ${contextoFinanceiro.ultimasMovimentacoes
                       .map(m => `${m.data} - ${m.tipo}: ${m.valor} (${m.conta}) - ${m.descricao}`)
                       .join('\n')}
                       
                     📈 Análise por Categoria:
                     ${contextoFinanceiro.analiseCategoria?.map(c => 
                       `${c.nome}: ${c.total} (${c.percentual}% do total)`
                     ).join('\n')}

                     🔄 Fluxo de Caixa:
                     Total Entradas: ${contextoFinanceiro.totalEntradas}
                     Total Saídas: ${contextoFinanceiro.totalSaidas}
                     Saldo Período: ${contextoFinanceiro.saldoPeriodo}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.8,
      }),
    });

    console.log('Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na resposta da API Groq:', errorData);
      throw new Error(`Erro na API Groq: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Resposta da API Groq recebida com sucesso');

    return new Response(
      JSON.stringify({ answer: result.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função do assistente financeiro:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar sua consulta: ' + error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});