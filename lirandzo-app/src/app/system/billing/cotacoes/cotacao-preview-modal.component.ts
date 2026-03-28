import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';
import html2pdf from 'html2pdf.js';
import {
  ItemCotacao,
  parseDescricaoCarga,
  repartirValorTotalNosItensSeNecessario
} from './cotacao-descricao-itens.util';

/** Pré-visualização / PDF na mesma sessão (lista de cotações enviadas). */
@Component({
  selector: 'app-cotacao-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotacao-preview-modal.component.html',
  styleUrls: [
    './cotacao-preview-modal.component.css',
    './cotacoes-cadastro.component.css',
    '../shared/billing-page.css'
  ]
})
export class CotacaoPreviewModalComponent implements OnInit {
  @Input({ required: true }) cotacaoId!: number;
  @Output() closed = new EventEmitter<void>();

  private readonly cotacaoService = inject(CotacaoService);

  loading = true;
  loadError: string | null = null;

  cotacao = {
    referencia: '',
    data: '',
    clienteNome: '',
    clienteTelefone: '',
    clienteEmail: '',
    origem: '',
    destino: '',
    tipoServico: 'TRANSPORTE',
    discountAmount: 0,
    custoRecolha: null as number | null
  };

  itens: ItemCotacao[] = [];
  private ultimaRef = '';

  ngOnInit(): void {
    this.cotacaoService.obterCotacao(this.cotacaoId).subscribe({
      next: (c) => {
        this.mapearResposta(c);
        this.loading = false;
        this.loadError = null;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Não foi possível carregar a cotação.';
      }
    });
  }

  private mapearResposta(c: CotacaoResponse): void {
    this.cotacao.referencia = c.referencia || '';
    this.ultimaRef = c.referencia || '';
    this.cotacao.data = c.dataCotacao ? c.dataCotacao.slice(0, 10) : '';
    this.cotacao.clienteNome = c.cliente?.nome || '';
    this.cotacao.clienteTelefone = c.cliente?.telefone || '';
    this.cotacao.clienteEmail = c.cliente?.email || '';
    this.cotacao.origem = c.origem || '';
    this.cotacao.destino = c.destino || '';
    this.cotacao.tipoServico = c.tipoServico || 'TRANSPORTE';
    this.cotacao.discountAmount = c.discountAmount ?? 0;
    this.cotacao.custoRecolha = c.custoRecolha ?? null;

    if (c.descricaoCarga) {
      this.itens = parseDescricaoCarga(c.descricaoCarga);
      if (this.itens.length === 0) {
        this.itens = [{ descricao: c.descricaoCarga, quantidade: 1, unidade: '', precoUnitario: null }];
      }
    } else {
      this.itens = [];
    }
    this.itens = repartirValorTotalNosItensSeNecessario(this.itens, c);
  }

  fechar(): void {
    this.closed.emit();
  }

  getSubtotalItem(item: ItemCotacao): number {
    return item.precoUnitario ?? 0;
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return this.cotacao.custoRecolha || 0;
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  private get descontoPreview(): number {
    return this.cotacao.discountAmount ?? 0;
  }

  private get temIvaPreview(): boolean {
    return (this.cotacao.tipoServico || '').toUpperCase() === 'COMPRA_TRANSPORTE';
  }

  get ivaAtivoPreview(): boolean {
    return this.temIvaPreview;
  }

  get vatAmountPreview(): number {
    const baseAposDesconto = Math.max(0, (this.totalGeral ?? 0) - this.descontoPreview);
    return this.temIvaPreview ? baseAposDesconto * 0.16 : 0;
  }

  get vatReasonPreview(): string {
    return this.temIvaPreview ? 'IVA 16%' : 'ISENTO';
  }

  formatarData(data: string | null | undefined): string {
    if (!data) return 'N/A';
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const m = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      }
      return new Date(data).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return data;
    }
  }

  getQuotationDocumentName(): string {
    const ref = (this.cotacao.referencia || this.ultimaRef || '').toString();
    const year = this.cotacao.data ? this.cotacao.data.substring(0, 4) : String(new Date().getFullYear());
    const clientSlug = this.slugifyClientName(this.cotacao.clienteNome || 'client');
    const quoteIndexCode = this.extractQuoteIndexCode(ref);
    return `ct${quoteIndexCode}_${clientSlug}_${year}`;
  }

  private slugifyClientName(name: string): string {
    const normalized = (name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const alnum = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return alnum || 'client';
  }

  private extractQuoteIndexCode(ref: string): string {
    const match = ref.match(/\d{4}-(\d{4,})/);
    if (match && match[1]) return match[1].slice(0, 2).padStart(2, '0');
    return '00';
  }

  async baixarPdf(): Promise<void> {
    const element = document.getElementById('cotacao-preview-content-enviadas');
    if (!element) return;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${this.getQuotationDocumentName()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['css', 'legacy'] as ('css' | 'legacy')[] }
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
    }
  }
}
