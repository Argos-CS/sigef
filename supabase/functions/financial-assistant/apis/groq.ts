import { corsHeaders } from '../utils/cors.ts';

export async function callGroqAPI(query: string, contextoFinanceiro: any) {
  console.log('Calling Groq API with query:', query);
  
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY não configurada');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
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

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const gptResponse = await response.json();
  return gptResponse.choices[0].message.content;
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