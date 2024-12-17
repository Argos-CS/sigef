import { supabase } from '@/integrations/supabase/client';

export async function optimizeTables() {
  const tables = [
    'movimentacoes',
    'chat_messages',
    'movimentacao_comments',
    'movimentacoes_audit',
    'profiles',
    'system_logs'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('maintenance_vacuum_analyze', {
        table_name: table
      });
      
      if (error) {
        console.error(`Error optimizing table ${table}:`, error);
      } else {
        console.log(`Successfully optimized table ${table}`);
      }
    } catch (err) {
      console.error(`Failed to optimize table ${table}:`, err);
    }
  }
}