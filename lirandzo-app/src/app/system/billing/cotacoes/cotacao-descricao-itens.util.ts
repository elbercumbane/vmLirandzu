import { CotacaoResponse } from '../../../services/cotacao.service';

export interface ItemCotacao {
  descricao: string;
  quantidade: number;
  unidade: 'kg' | 'toneladas' | '';
  precoUnitario: number | null;
}

/**
 * Parseia o texto da descrição da carga (mesma lógica que o cadastro de cotações).
 */
export function parseDescricaoCarga(texto: string): ItemCotacao[] {
  const itens: ItemCotacao[] = [];
  const linhas = texto.includes('\n')
    ? texto.split(/\r?\n/)
    : texto.split(/,(?![^\[]*\])/).map((s) => s.trim());

  const linhasFiltradas = linhas.map((l) => l.trim()).filter((l) => l.length > 0);

  const numUnidadeRegex = /^([\d.,]+)\s*(kgs?|kilos?|quilos?|toneladas?|toneldas?|tonneladas?|t)\b\s*(?:de\s+)?(.*)$/i;
  const unidadeDescricaoRegex = /^(kgs?|kilos?|quilos?|toneladas?|toneldas?|tonneladas?|t)\b\s+(.+)$/i;
  const precoRegex = /\[PRECO:([\d.]+)\]/;

  const normalizarUnidade = (raw: string): 'kg' | 'toneladas' | '' => {
    const r = raw.toLowerCase();
    if (/^(kg|kgs|kilo|kilos|quilo|quilos)$/.test(r)) return 'kg';
    if (/^(tonelada|toneladas|toneldas?|tonneladas?|t)$/.test(r)) return 'toneladas';
    return '';
  };

  const extrairPreco = (linha: string): { texto: string; preco: number | null } => {
    const m = linha.match(precoRegex);
    if (m) {
      return { texto: linha.replace(precoRegex, '').trim(), preco: parseFloat(m[1]) };
    }
    return { texto: linha, preco: null };
  };

  for (const linha of linhasFiltradas) {
    const { texto: linhaLimpa, preco } = extrairPreco(linha);
    const limpa = linhaLimpa.replace(/^\s*\d+[.)]\s*/, '').trim();
    const matchNum = limpa.match(numUnidadeRegex);
    const matchUnidade = limpa.match(unidadeDescricaoRegex);

    if (matchNum) {
      const numStr = (matchNum[1] || '').replace(',', '.');
      const quantidade = parseFloat(numStr) || 1;
      const unidade = normalizarUnidade(matchNum[2] || '');
      const descResto = (matchNum[3] || '').trim();
      itens.push({
        descricao: descResto || limpa,
        quantidade: Math.round(quantidade) === quantidade ? quantidade : Math.round(quantidade * 100) / 100,
        unidade,
        precoUnitario: preco
      });
    } else if (matchUnidade) {
      const unidade = normalizarUnidade(matchUnidade[1] || '');
      const descResto = (matchUnidade[2] || '').trim();
      itens.push({
        descricao: descResto || limpa,
        quantidade: 1,
        unidade,
        precoUnitario: preco
      });
    } else {
      itens.push({ descricao: limpa || linhaLimpa, quantidade: 1, unidade: '', precoUnitario: preco });
    }
  }
  return itens;
}

/**
 * Quando o backend tem valor total mas as linhas sem preços, reparte o transporte pelos itens.
 */
export function repartirValorTotalNosItensSeNecessario(
  itens: ItemCotacao[],
  cotacao: CotacaoResponse
): ItemCotacao[] {
  if (!itens.length) return itens;

  const somaLinhas = itens.reduce((acc, i) => acc + (i.precoUnitario ?? 0), 0);
  if (somaLinhas > 0.01) return itens;

  const recolha = cotacao.custoRecolha ?? 0;
  const valorTotalBackend = cotacao.valorTotal ?? null;
  const custoTransporteBackend = cotacao.custoTransporte ?? null;

  let baseItens: number;
  if (custoTransporteBackend != null && custoTransporteBackend > 0) {
    baseItens = custoTransporteBackend;
  } else if (valorTotalBackend != null && valorTotalBackend > 0) {
    baseItens = Math.max(0, valorTotalBackend - recolha);
  } else return itens;

  if (baseItens <= 0) return itens;

  const n = itens.length;
  const porLinha = Math.round((baseItens / n) * 100) / 100;
  let resto = baseItens - porLinha * (n - 1);
  return itens.map((it, idx) => ({
    ...it,
    precoUnitario: idx === n - 1 ? Math.round(resto * 100) / 100 : porLinha
  }));
}
