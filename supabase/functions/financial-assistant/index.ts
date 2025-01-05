import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/cors.ts';
import { prepararContextoFinanceiro } from './utils/context.ts';
import { callGroqAPI } from './apis/groq.ts';
import { callAnthropicAPI } from './apis/anthropic.ts';

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

    let answer;
    switch (model) {
      case 'anthropic':
        answer = await callAnthropicAPI(query, contextoFinanceiro);
        break;
      case 'groq':
      default:
        answer = await callGroqAPI(query, contextoFinanceiro);
        break;
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