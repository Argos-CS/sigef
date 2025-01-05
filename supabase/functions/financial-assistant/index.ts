import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { format, parseISO, isWithinInterval } from 'https://esm.sh/date-fns@2.30.0';
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
      .order('data', { ascending: true });

    if (movError) {
      console.error('Error fetching movimentacoes:', movError);
      throw movError;
    }

    console.log('Retrieved movimentacoes count:', movimentacoes?.length);

    // Função para calcular saldo até uma data específica
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

    // Função para formatar valores monetários
    const formatarMoeda = (valor: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    };

    // Função para formatar data
    const formatarData = (data: string) => {
      return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
    };

    // Extrair datas mencionadas na pergunta
    const extrairData = (texto: string) => {
      const regexData = /(\d{2}\/\d{2}\/\d{4}|\d{2}\-\d{2}\-\d{4})/g;
      const matches = texto.match(regexData);
      if (matches) {
        const data = matches[0].replace(/\-/g, '/');
        const [dia, mes, ano] = data.split('/');
        return `${ano}-${mes}-${dia}`;
      }
      return null;
    };

    // Preparar contexto financeiro
    const dataConsulta = extrairData(query) || new Date().toISOString().split('T')[0];
    const saldos = calcularSaldoAteData(dataConsulta);
    const saldoTotal = Object.values(saldos).reduce((a, b) => a + b, 0);

    // Encontrar últimas 5 movimentações até a data
    const ultimasMovimentacoes = movimentacoes
      ?.filter(mov => mov.data <= dataConsulta)
      .slice(-5)
      .map(mov => ({
        data: formatarData(mov.data),
        tipo: mov.tipo,
        conta: mov.conta,
        valor: formatarMoeda(Number(mov.valor)),
        descricao: mov.descricao
      }));

    // Preparar contexto financeiro estruturado
    const contextoFinanceiro = {
      dataConsulta: formatarData(dataConsulta),
      saldos: Object.entries(saldos).map(([conta, valor]) => ({
        conta,
        valor: formatarMoeda(valor)
      })),
      saldoTotal: formatarMoeda(saldoTotal),
      ultimasMovimentacoes
    };

    console.log('Prepared financial context:', JSON.stringify(contextoFinanceiro, null, 2));

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
                     Analise os dados fornecidos e responda de forma clara e estruturada, seguindo estas diretrizes:

                     1. Use emojis relevantes para tornar a resposta mais amigável
                     2. Estruture a resposta em seções claras com títulos em negrito
                     3. Sempre formate valores monetários adequadamente
                     4. Seja direto e objetivo nas respostas
                     5. Se a pergunta envolver uma data específica, confirme a data na resposta
                     6. Se não houver dados suficientes, explique claramente o motivo

                     Dados disponíveis para análise:
                     
                     📅 Data da Consulta: ${contextoFinanceiro.dataConsulta}

                     💰 Saldos por Conta:
                     ${contextoFinanceiro.saldos.map(s => `${s.conta}: ${s.valor}`).join('\n')}

                     🏦 Saldo Total: ${contextoFinanceiro.saldoTotal}

                     📝 Últimas Movimentações:
                     ${contextoFinanceiro.ultimasMovimentacoes
                       .map(m => `${m.data} - ${m.tipo}: ${m.valor} (${m.conta}) - ${m.descricao}`)
                       .join('\n')}
                     `
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