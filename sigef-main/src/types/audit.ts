export type AuditStatus = 'aprovado' | 'reprovado' | 'pendente';

export interface MovimentacaoAudit {
  id: string;
  movimentacao_id: string;
  auditor_id: string;
  status: AuditStatus;
  comentario?: string;
  created_at?: string;
  updated_at?: string;
}