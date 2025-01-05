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
    console.log('Received query:', query);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: movimentacoes, error: movError } = await supabaseClient
      .from('movimentacoes')
      .select('*')
      .order('data', { ascending: true });

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    const contextoFinanceiro = prepararContextoFinanceiro(movimentacoes);
    console.log('Prepared financial context:', JSON.stringify(contextoFinanceiro, null, 2));

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente financeiro especializado em análise de dados financeiros.
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
                       ${contextoFinanceiro.saldos.map((s: any) => `${s.conta}: ${s.valor}`).join('\n')}

                       🏦 Saldo Total: ${contextoFinanceiro.saldoTotal}

                       📝 Últimas Movimentações:
                       ${contextoFinanceiro.ultimasMovimentacoes
                         .map((m: any) => `${m.data} - ${m.tipo}: ${m.valor} (${m.conta}) - ${m.descricao}`)
                         .join('\n')}`
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Anthropic API error:', errorData);
        
        // Check for credit balance error
        if (errorData.error?.message?.includes('credit balance is too low')) {
          throw new Error('Créditos da API Anthropic esgotados. Por favor, atualize seu plano ou adicione mais créditos.');
        }
        
        throw new Error(`Erro na API Anthropic: ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      return new Response(
        JSON.stringify({ answer: result.content[0].text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error in Anthropic API call:', error);
      throw error;
    }

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