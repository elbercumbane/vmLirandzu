import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import html2pdf from 'html2pdf.js';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EmitirFacturaResponse, EncomendaService } from '../../../services/encomenda.service';
import { ClienteService } from '../../../services/cliente.service';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import {
  parseDescricaoCarga,
  repartirValorTotalNosItensSeNecessario
} from '../cotacoes/cotacao-descricao-itens.util';
import type { CondicaoPagamentoCotacao } from '../../../services/cotacao.service';
import {
  CONDICAO_PAGAMENTO_OPCOES,
  labelCondicaoPagamentoPt,
  normalizeCondicaoPagamento
} from '../cotacoes/cotacao-condicao-pagamento.util';

interface ItemEncomenda {
  quantidade: number;
  descricao: string;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-encomendas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './encomendas-cadastro.component.html',
  styleUrls: [
    '../shared/billing-page.css',
    '../cotacoes/cotacoes-cadastro.component.css',
    './encomendas-cadastro.component.css'
  ]
})
export class EncomendasCadastroComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  encomenda = {
    data: new Date().toISOString().split('T')[0],
    clienteNome: '',
    clienteEmail: '',
    clienteEndereco: '',
    clienteProvincia: '',
    clienteContacto: '',
    clienteTelefone: '',
    clienteNuit: '',
    origemTransporte: '',
    destinoTransporte: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    discountAmount: 0,
    tipoServico: 'TRANSPORTE',
    condicaoPagamento: 'TOTALIDADE' as CondicaoPagamentoCotacao
  };

  readonly opcoesCondicaoPagamento = CONDICAO_PAGAMENTO_OPCOES;

  itens: ItemEncomenda[] = [{ quantidade: 1, descricao: '', precoUnitario: null }];

  provincias = [
    'Maputo Cidade',
    'Maputo Província',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zambézia',
    'Nampula',
    'Niassa',
    'Cabo Delgado'
  ];

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  clienteId: number | null = null;

  cotacaoId: number | null = null;
  modoDesdeCotacao = false;
  carregandoCotacao = false;
  aFinalizarFactura = false;
  referenciaCotacao = '';

  /** Preenchido após emitir — renderiza o bloco off-screen para html2pdf. */
  ultimaFacturaPdf: { invoiceNumber: string; invoiceDateIso: string } | null = null;

  readonly helpItemsManual: string[] = [
    'Preencha os dados do cliente (destinatário); o número e a data da factura são gerados automaticamente ao gravar.',
    'Adicione itens, custos adicionais (transporte, recolha, bill of entry), desconto e IVA quando aplicável — como na cotação.',
    'Revise o total final antes de gravar ou integrar com o módulo de tesouraria.'
  ];

  readonly helpItemsDesdeCotacao: string[] = [
    'Os dados vêm da cotação aceite; o cliente na factura é o da cotação (altere a cotação antes se precisar de outro registo).',
    'Ajuste itens, custos, rota (origem/destino) e totais como na revisão final da cotação.',
    '«Finalizar factura» grava a encomenda, descarrega o PDF (nome: número + empresa + data) e marca a cotação como facturada.'
  ];

  constructor(
    private encomendaService: EncomendaService,
    private clienteService: ClienteService,
    private cotacaoService: CotacaoService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((qp) => {
      const raw = qp.get('cotacaoId');
      if (raw) {
        const id = Number(raw);
        if (Number.isFinite(id) && id > 0) {
          this.cotacaoId = id;
          this.modoDesdeCotacao = true;
          this.carregarCotacaoParaFactura(id);
          return;
        }
      }
      this.cotacaoId = null;
      this.modoDesdeCotacao = false;
      this.referenciaCotacao = '';
      this.encomenda.data = new Date().toISOString().split('T')[0];
    });
  }

  get headerTitle(): string {
    return this.modoDesdeCotacao ? 'Emitir factura' : 'Nova Encomenda / Factura';
  }

  get headerSubtitle(): string {
    if (this.modoDesdeCotacao) {
      return this.referenciaCotacao
        ? `Cotação ${this.referenciaCotacao} — revise os dados e finalize.`
        : 'Revise os dados carregados da cotação e finalize a factura.';
    }
    return 'Preencha os dados da encomenda conforme a factura';
  }

  get headerBackLink(): string {
    return this.modoDesdeCotacao ? '/billing/cotacoes/para-facturar' : '/billing/encomendas';
  }

  get headerHelpItems(): string[] {
    return this.modoDesdeCotacao ? this.helpItemsDesdeCotacao : this.helpItemsManual;
  }

  adicionarItem(): void {
    this.itens.push({ quantidade: 1, descricao: '', precoUnitario: null });
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) this.itens.splice(index, 1);
  }

  getSubtotalItem(item: ItemEncomenda): number {
    return item.quantidade * (item.precoUnitario || 0);
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return (
      (this.encomenda.custoTransporte || 0) +
      (this.encomenda.custoRecolha || 0) +
      (this.encomenda.custoBillOfEntry || 0)
    );
  }

  /** Subtotal bruto (itens + custos adicionais), antes de desconto e IVA — alinhado à base da cotação. */
  get baseBruta(): number {
    return this.subtotalItens + this.totalCustos;
  }

  get descontoAplicado(): number {
    return this.encomenda.discountAmount ?? 0;
  }

  get baseAposDesconto(): number {
    return Math.max(0, this.baseBruta - this.descontoAplicado);
  }

  get temIva(): boolean {
    return (this.encomenda.tipoServico || '').toUpperCase() === 'COMPRA_TRANSPORTE';
  }

  get valorIva(): number {
    return this.temIva ? this.baseAposDesconto * 0.16 : 0;
  }

  get motivoIvaLegivel(): string {
    return this.temIva ? 'IVA 16%' : 'ISENTO';
  }

  /** Valor a gravar na encomenda / a enviar na emissão a partir da cotação. */
  get totalFacturavel(): number {
    return this.baseAposDesconto + this.valorIva;
  }

  get textoCondicaoPagamento(): string {
    return labelCondicaoPagamentoPt(this.encomenda.condicaoPagamento);
  }

  get dataFacturaLegivel(): string {
    const raw = (this.encomenda.data || '').trim();
    if (!raw) return '—';
    const p = raw.split('T')[0].split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return raw;
  }

  setIvaAtivo(ativo: boolean): void {
    this.encomenda.tipoServico = ativo ? 'COMPRA_TRANSPORTE' : 'TRANSPORTE';
  }

  salvar(): void {
    if (!this.isFormularioValidoManual()) {
      this.mostrarNotificacao('Preencha os campos obrigatórios, itens e garanta total final maior que zero.', 'error');
      return;
    }

    this.criarOuBuscarCliente()
      .then((clienteId) => {
        if (!clienteId) {
          this.mostrarNotificacao('Factura não guardada', 'error');
          return;
        }

        const produto =
          this.itens.map((item) => `${item.quantidade}x ${item.descricao || 'Item'}`).join(', ') || 'Encomenda';

        const origem = this.encomenda.clienteEndereco;
        const destino = this.encomenda.clienteProvincia || this.encomenda.clienteEndereco;

        const encomendaData = {
          cliente: { id: clienteId },
          produto,
          origem,
          destino,
          valorTotal: this.totalFacturavel,
          valorPago: 0,
          dataEncomenda: this.encomenda.data || new Date().toISOString().split('T')[0]
        };

        this.encomendaService.criarEncomenda(encomendaData).subscribe({
          next: () => {
            this.mostrarNotificacao('Factura guardada', 'success');
            setTimeout(() => this.resetForm(), 2000);
          },
          error: () => {
            this.mostrarNotificacao('Factura não guardada', 'error');
          }
        });
      })
      .catch(() => {
        this.mostrarNotificacao('Factura não guardada', 'error');
      });
  }

  finalizarFacturaDesdeCotacao(): void {
    if (this.aFinalizarFactura || !this.cotacaoId) return;
    if (!this.clienteId) {
      this.mostrarNotificacao('Cotação sem cliente associado.', 'error');
      return;
    }
    if (!this.isFormularioValidoDesdeCotacao()) {
      this.mostrarNotificacao(
        'Preencha cliente, endereço, origem e destino da rota, itens com totais válidos (total > 0).',
        'error'
      );
      return;
    }

    const produto = this.montarDescricaoProdutoParaApi();
    const valorTotal = this.totalFacturavel;
    const origem = (this.encomenda.origemTransporte || '').trim().substring(0, 200);
    const destino = (this.encomenda.destinoTransporte || '').trim().substring(0, 200);

    this.aFinalizarFactura = true;
    const dataEnc = (this.encomenda.data || '').trim() || new Date().toISOString().split('T')[0];
    this.encomendaService
      .emitirFacturaDeCotacao(this.cotacaoId, {
        produto,
        origem,
        destino,
        valorTotal,
        dataEncomenda: dataEnc,
        clienteNome: (this.encomenda.clienteNome || '').trim() || undefined,
        clienteTelefone: (this.encomenda.clienteTelefone || '').trim() || undefined,
        clienteEndereco: (this.encomenda.clienteEndereco || '').trim() || undefined,
        clienteNif: (this.encomenda.clienteNuit || '').trim() || undefined,
        clienteProvincia: (this.encomenda.clienteProvincia || '').trim() || undefined,
        clientePessoaContacto: (this.encomenda.clienteContacto || '').trim() || undefined
      })
      .subscribe({
        next: (resp: EmitirFacturaResponse) => {
          this.aFinalizarFactura = false;
          const ref = resp.invoiceNumber || (resp.numeroEncomenda != null ? `FAC-${resp.numeroEncomenda}` : '');
          this.mostrarNotificacao(
            ref ? `Factura ${ref} emitida. A descarregar o PDF…` : 'Factura emitida.',
            'success'
          );
          const inv = (resp.invoiceNumber || ref || 'FACTURA').trim();
          const dIso = this.normalizarDataFacturaResposta(resp.invoiceDate);
          this.ultimaFacturaPdf = { invoiceNumber: inv, invoiceDateIso: dIso };
          this.cdr.detectChanges();
          setTimeout(() => {
            void this.baixarPdfFacturaEmitida().finally(() => {
              this.ultimaFacturaPdf = null;
              this.cdr.detectChanges();
              this.router.navigate(['/billing/encomendas']);
            });
          }, 250);
        },
        error: (err: unknown) => {
          this.aFinalizarFactura = false;
          const body =
            err && typeof err === 'object' && 'error' in err
              ? (err as { error?: { error?: string; message?: string } }).error
              : undefined;
          const msg = body?.error || body?.message || 'Não foi possível emitir a factura.';
          this.mostrarNotificacao(msg, 'error');
        }
      });
  }

  /** Primeiro valor não vazio entre várias chaves possíveis no JSON do cliente (API/portal). */
  private textoCliente(obj: unknown, ...keys: string[]): string {
    if (obj == null || typeof obj !== 'object') return '';
    const o = obj as Record<string, unknown>;
    for (const k of keys) {
      const v = o[k];
      if (v == null) continue;
      const s = String(v).trim();
      if (s) return s;
    }
    return '';
  }

  private carregarCotacaoParaFactura(id: number): void {
    this.carregandoCotacao = true;
    this.cotacaoService.obterCotacao(id).subscribe({
      next: (c: CotacaoResponse) => {
        this.carregandoCotacao = false;
        const st = (c.status || '').toUpperCase();
        if (st === 'INVOICED' || st === 'FACTURADA') {
          this.mostrarNotificacao('Esta cotação já foi facturada.', 'error');
          this.router.navigate(['/billing/encomendas']);
          return;
        }
        if (st !== 'RESPONDED' && st !== 'RESPONDIDO' && st !== 'ACCEPTED') {
          this.mostrarNotificacao('Só pode emitir factura com cotação aceite pelo cliente.', 'error');
          this.router.navigate(['/billing/cotacoes/para-facturar']);
          return;
        }

        this.referenciaCotacao = c.referencia || '';
        const cli = c.cliente;
        this.clienteId = cli?.id ?? null;
        this.encomenda.clienteNome = this.textoCliente(cli, 'nome', 'name');
        this.encomenda.clienteEmail = this.textoCliente(cli, 'email', 'mail');
        this.encomenda.clienteTelefone = this.textoCliente(cli, 'telefone', 'phone', 'telephone');
        this.encomenda.clienteEndereco = this.textoCliente(cli, 'endereco', 'address', 'morada');
        this.encomenda.clienteNuit = this.textoCliente(cli, 'nif', 'nuit', 'taxId', 'tax_id');
        this.encomenda.clienteProvincia = this.textoCliente(cli, 'provincia', 'province');
        this.encomenda.clienteContacto = this.textoCliente(
          cli,
          'pessoaContacto',
          'pessoa_contacto',
          'contactPerson',
          'contact_person',
          'att'
        );
        this.encomenda.data = new Date().toISOString().split('T')[0];
        this.encomenda.origemTransporte = c.origem || '';
        this.encomenda.destinoTransporte = c.destino || '';
        this.encomenda.custoRecolha = c.custoRecolha ?? null;
        this.encomenda.custoTransporte = c.custoTransporte ?? null;
        this.encomenda.custoBillOfEntry = c.custoBillOfEntry ?? null;
        this.encomenda.tipoServico = c.tipoServico || 'TRANSPORTE';
        this.encomenda.discountAmount = c.discountAmount ?? 0;
        this.encomenda.condicaoPagamento =
          normalizeCondicaoPagamento(c.condicaoPagamento) ?? 'TOTALIDADE';

        let it = c.descricaoCarga ? parseDescricaoCarga(c.descricaoCarga) : [];
        if (!it.length) {
          it = [
            {
              descricao: c.descricaoCarga || 'Carga',
              quantidade: 1,
              unidade: '',
              precoUnitario: null
            }
          ];
        }
        it = repartirValorTotalNosItensSeNecessario(it, c);
        this.itens = it.map((x) => ({
          quantidade: x.quantidade,
          descricao: [x.descricao, x.unidade].filter(Boolean).join(' ').trim() || x.descricao,
          precoUnitario: x.precoUnitario
        }));
      },
      error: () => {
        this.carregandoCotacao = false;
        this.mostrarNotificacao('Não foi possível carregar a cotação.', 'error');
        this.router.navigate(['/billing/cotacoes/para-facturar']);
      }
    });
  }

  private montarDescricaoProdutoParaApi(): string {
    const partes: string[] = [];
    for (const it of this.itens) {
      if (!it.descricao?.trim()) continue;
      const q = it.quantidade != null && it.quantidade > 1 ? `${it.quantidade}x ` : '';
      partes.push(`${q}${it.descricao.trim()}`.trim());
    }
    let base = partes.join('; ');
    if (base.length >= 5) return base.substring(0, 200);
    const o = (this.encomenda.origemTransporte || '').trim();
    const d = (this.encomenda.destinoTransporte || '').trim();
    const fallback = [o, d].filter(Boolean).join(' → ') || 'Transporte de carga';
    const out = base ? `${base} | ${fallback}` : fallback;
    return out.substring(0, 200);
  }

  private isFormularioValidoManual(): boolean {
    return !!(
      this.encomenda.clienteNome?.trim() &&
      this.encomenda.clienteEndereco?.trim() &&
      this.totalFacturavel > 0
    );
  }

  private isFormularioValidoDesdeCotacao(): boolean {
    return !!(
      this.encomenda.clienteNome?.trim() &&
      this.encomenda.clienteEndereco?.trim() &&
      this.encomenda.origemTransporte?.trim() &&
      this.encomenda.destinoTransporte?.trim() &&
      this.totalFacturavel > 0
    );
  }

  private criarOuBuscarCliente(): Promise<number> {
    return new Promise((resolve, reject) => {
      const nome = this.encomenda.clienteNome?.trim();
      const telefone = this.encomenda.clienteTelefone?.trim();

      if (nome || telefone) {
        this.clienteService.buscarClientes(nome, telefone).subscribe({
          next: (clientes) => {
            if (clientes && clientes.length > 0) {
              const clienteEncontrado =
                clientes.find(
                  (c) => c.nome?.toLowerCase() === nome?.toLowerCase() || c.telefone === telefone
                ) || clientes[0];

              if (clienteEncontrado.id) {
                resolve(clienteEncontrado.id);
              } else {
                this.criarNovoCliente().then(resolve).catch(reject);
              }
            } else {
              this.criarNovoCliente().then(resolve).catch(reject);
            }
          },
          error: () => {
            this.criarNovoCliente().then(resolve).catch(reject);
          }
        });
      } else {
        this.criarNovoCliente().then(resolve).catch(reject);
      }
    });
  }

  private criarNovoCliente(): Promise<number> {
    return new Promise((resolve, reject) => {
      const clienteData = {
        nome: this.encomenda.clienteNome,
        telefone: this.encomenda.clienteTelefone || '',
        email: '',
        endereco: (this.encomenda.clienteEndereco || '').trim(),
        nif: (this.encomenda.clienteNuit || '').trim(),
        provincia: (this.encomenda.clienteProvincia || '').trim(),
        pessoaContacto: (this.encomenda.clienteContacto || '').trim()
      };

      this.clienteService.criarCliente(clienteData).subscribe({
        next: (cliente) => {
          if (cliente.id) {
            resolve(cliente.id);
          } else {
            reject(new Error('Cliente criado mas sem ID'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /** Data da API (string ISO ou array Jackson) → yyyy-MM-dd */
  private normalizarDataFacturaResposta(raw: string | number[] | undefined | null): string {
    if (raw == null) {
      return new Date().toISOString().split('T')[0];
    }
    if (Array.isArray(raw) && raw.length >= 3) {
      const y = raw[0];
      const m = String(raw[1]).padStart(2, '0');
      const d = String(raw[2]).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(raw);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return new Date().toISOString().split('T')[0];
  }

  /** Rótulo no PDF (dd/MM/yyyy). */
  formatarDataFacturaPdf(iso: string): string {
    const p = (iso || '').split('T')[0].split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return iso || '—';
  }

  /** Sufixo do ficheiro: dd-MM-yyyy */
  private dataParaNomeFicheiro(iso: string): string {
    const p = (iso || '').split('T')[0].split('-');
    if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }

  private slugifyNomeEmpresaFicheiro(name: string): string {
    const normalized = (name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const alnum = normalized.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    return (alnum || 'cliente').slice(0, 48);
  }

  montarNomeFicheiroFacturaPdf(invoiceNumber: string, empresaNome: string, dateIso: string): string {
    const inv = (invoiceNumber || 'FACTURA').replace(/[\\/:*?"<>|]+/g, '_');
    const slug = this.slugifyNomeEmpresaFicheiro(empresaNome);
    const data = this.dataParaNomeFicheiro(dateIso);
    return `${inv}_${slug}_${data}.pdf`;
  }

  private async baixarPdfFacturaEmitida(): Promise<void> {
    const root = document.getElementById('invoice-pdf-export');
    if (!root || !this.ultimaFacturaPdf) return;

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    const nome = this.montarNomeFicheiroFacturaPdf(
      this.ultimaFacturaPdf.invoiceNumber,
      this.encomenda.clienteNome,
      this.ultimaFacturaPdf.invoiceDateIso
    );

    const clone = root.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.classList.remove('invoice-pdf-offscreen');
    clone.setAttribute('aria-hidden', 'true');
    // Posicionar no viewport (0,0) para html2canvas capturar correctamente.
    // left negativo causa PDF em branco em alguns browsers.
    Object.assign(clone.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '794px',
      maxWidth: '794px',
      background: '#ffffff',
      zIndex: '2147483647',
      pointerEvents: 'none',
      overflow: 'visible'
    });
    document.body.appendChild(clone);
    // Forçar layout e aguardar render completo
    void clone.offsetHeight;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: nome,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'] as ('css' | 'legacy')[] }
    };
    try {
      await html2pdf().set(opt).from(clone).save();
    } catch (e) {
      console.error(e);
    } finally {
      clone.remove();
    }
  }

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  private resetForm(): void {
    this.encomenda = {
      data: new Date().toISOString().split('T')[0],
      clienteNome: '',
      clienteEmail: '',
      clienteEndereco: '',
      clienteProvincia: '',
      clienteContacto: '',
      clienteTelefone: '',
      clienteNuit: '',
      origemTransporte: '',
      destinoTransporte: '',
      custoTransporte: null,
      custoRecolha: null,
      custoBillOfEntry: null,
      discountAmount: 0,
      tipoServico: 'TRANSPORTE',
      condicaoPagamento: 'TOTALIDADE'
    };
    this.itens = [{ quantidade: 1, descricao: '', precoUnitario: null }];
  }
}
