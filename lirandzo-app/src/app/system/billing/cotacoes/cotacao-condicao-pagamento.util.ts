import type { CondicaoPagamentoCotacao } from '../../../services/cotacao.service';

export const CONDICAO_PAGAMENTO_OPCOES: { value: CondicaoPagamentoCotacao; label: string }[] = [
  { value: 'TOTALIDADE', label: 'Pagamento na totalidade' },
  { value: 'ADIANTADO_TOTAL', label: 'Pagamento adiantado (total antecipado)' },
  { value: 'DUAS_PRESTACOES', label: 'Duas prestações' },
  { value: 'PARCIAL', label: 'Pagamento parcial (a combinar)' }
];

const VALID: CondicaoPagamentoCotacao[] = CONDICAO_PAGAMENTO_OPCOES.map((o) => o.value);

export function normalizeCondicaoPagamento(
  raw: string | null | undefined
): CondicaoPagamentoCotacao | null {
  if (!raw) return null;
  const u = String(raw).trim().toUpperCase() as CondicaoPagamentoCotacao;
  return VALID.includes(u) ? u : null;
}

export function labelCondicaoPagamentoPt(v: string | null | undefined): string {
  const row = CONDICAO_PAGAMENTO_OPCOES.find((o) => o.value === v);
  return row?.label ?? '—';
}
