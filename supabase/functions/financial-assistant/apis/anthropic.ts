import { corsHeaders } from '../utils/cors.ts';

export async function callAnthropicAPI(query: string, contextoFinanceiro: any) {
  console.log('Calling Anthropic API with query:', query);
  
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada');
  }

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
          content: getSystemPrompt(contextoFinanceiro)
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
    throw new Error(`Anthropic API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return result.content[0].text;
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
         ${contextoFinanceiro.saldos.map((s: any) => `${s.conta}: ${s.valor}`).join('\n')}

         🏦 Saldo Total: ${contextoFinanceiro.saldoTotal}

         📝 Últimas Movimentações:
         ${contextoFinanceiro.ultimasMovimentacoes
           .map((m: any) => `${m.data} - ${m.tipo}: ${m.valor} (${m.conta}) - ${m.descricao}`)
           .join('\n')}`;
}