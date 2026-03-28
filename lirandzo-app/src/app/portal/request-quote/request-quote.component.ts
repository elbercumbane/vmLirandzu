import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CotacaoPortalRequest, CotacaoService } from '../../services/cotacao.service';
import { gsap } from 'gsap';

type FormaEnvio = CotacaoPortalRequest['formaEnvioPreferida'];

/** Chaves de campos que podem ser validados / realçados */
type QuoteFieldKey =
  | 'name'
  | 'email'
  | 'phone1'
  | 'origin'
  | 'destination'
  | 'deliveryMethod'
  | 'message';

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './request-quote.component.html',
  styleUrl: './request-quote.component.css'
})
export class RequestQuoteComponent implements AfterViewInit {
  private cotacaoService = inject(CotacaoService);
  private transloco = inject(TranslocoService);
  private el = inject(ElementRef);

  submitted = false;
  loading = false;
  errorKey = '';
  confirmacaoOpen = false;
  validationModalOpen = false;
  /** Campos com erro após tentativa de envio (realce vermelho) */
  invalidFields = new Set<QuoteFieldKey>();
  /** Símbolos removidos por sanitização fora do campo e-mail (mostrar aviso no assistente). */
  charsStrippedOutsideEmail = false;
  /** Caracteres removidos apenas no campo e-mail (aviso curto, separado). */
  charsStrippedInEmailOnly = false;

  expandedSections: Record<'dados' | 'detalhes' | 'mensagem', boolean> = {
    dados: true,
    detalhes: false,
    mensagem: false
  };

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const heroInner = host.querySelector('.quote-hero-inner') as HTMLElement | null;
    const formCard = host.querySelector('.quote-form-card') as HTMLElement | null;
    const cardBody = host.querySelector('.quote-form-card-body') as HTMLElement | null;

    if (heroInner) {
      gsap.fromTo(heroInner, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' });
    }
    if (formCard) {
      gsap.fromTo(formCard, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.08 });
    }
    if (cardBody) {
      gsap.fromTo(cardBody, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.12 });
    }
  }

  form = {
    name: '',
    email: '',
    phone1: '',
    origin: '',
    destination: '',
    message: '',
    deliveryMethod: '' as '' | FormaEnvio,
    tipoServico: 'TRANSPORTE' as 'TRANSPORTE' | 'COMPRA_TRANSPORTE'
  };

  /** Nome/empresa: letras (incl. acentos), números, espaços e pontuação básica. */
  private sanitizeNombreEmpresa(s: string): string {
    return s.replace(/[^\p{L}\p{N}\s.,'&\-()/ºª]/gu, '');
  }

  /** Origem/destino: idem (evita @ # ^ * etc.). */
  private sanitizeRota(s: string): string {
    return s.replace(/[^\p{L}\p{N}\s.,'&\-()/ºª]/gu, '');
  }

  /** Telefone: apenas dígitos, espaços, +, -, parênteses. */
  private sanitizeTelefone(s: string): string {
    return s.replace(/[^0-9+\s()-]/g, '');
  }

  /** E-mail: letras, números e @ . _ + - */
  private sanitizeEmail(s: string): string {
    return s.replace(/[^a-zA-Z0-9@._+-]/g, '');
  }

  /** Descrição da carga: remove símbolos não adequados; mantém texto útil para kg, toneladas, números. */
  private sanitizeMensagemCarga(s: string): string {
    return s.replace(/[@#$%^&*={}<>|[\]\\]/g, '');
  }

  onNameChange(v: string): void {
    const next = this.sanitizeNombreEmpresa(v);
    if (v !== next) this.charsStrippedOutsideEmail = true;
    this.form.name = next;
    if (this.form.name.trim()) this.invalidFields.delete('name');
  }

  onOriginChange(v: string): void {
    const next = this.sanitizeRota(v);
    if (v !== next) this.charsStrippedOutsideEmail = true;
    this.form.origin = next;
    if (this.form.origin.trim()) this.invalidFields.delete('origin');
  }

  onDestinationChange(v: string): void {
    const next = this.sanitizeRota(v);
    if (v !== next) this.charsStrippedOutsideEmail = true;
    this.form.destination = next;
    if (this.form.destination.trim()) this.invalidFields.delete('destination');
  }

  onPhoneChange(v: string): void {
    const next = this.sanitizeTelefone(v);
    if (v !== next) this.charsStrippedOutsideEmail = true;
    this.form.phone1 = next;
    if (this.form.phone1.trim()) this.invalidFields.delete('phone1');
  }

  onEmailChange(v: string): void {
    const next = this.sanitizeEmail(v);
    if (v !== next) this.charsStrippedInEmailOnly = true;
    this.form.email = next;
    if (this.form.email.trim()) this.invalidFields.delete('email');
  }

  onMessageChange(v: string): void {
    const next = this.sanitizeMensagemCarga(v);
    if (v !== next) this.charsStrippedOutsideEmail = true;
    this.form.message = next;
    if (this.form.message.trim()) this.invalidFields.delete('message');
  }

  onDeliveryMethodChange(): void {
    if (this.form.deliveryMethod) this.invalidFields.delete('deliveryMethod');
  }

  /**
   * Organiza o texto em lista numerada. O texto livre (ex.: 500 kg, 2 toneladas, t de cimento)
   * segue para o backend como descricaoCarga e é interpretado em billing por parseDescricaoCarga.
   */
  formatMessageToList(): void {
    const raw = this.form.message?.trim() || '';
    if (!raw) return;
    const lines = raw
      .split(/\r?\n/)
      .map(l => l.replace(/^\s*\d+\.\s*/, '').trim())
      .filter(l => l.length > 0);
    if (lines.length === 0) return;
    this.form.message = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
  }

  closeSuccessModal(): void {
    this.submitted = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form.name = '';
    this.form.email = '';
    this.form.phone1 = '';
    this.form.origin = '';
    this.form.destination = '';
    this.form.message = '';
    this.form.deliveryMethod = '';
    this.form.tipoServico = 'TRANSPORTE';
    this.invalidFields.clear();
    this.charsStrippedOutsideEmail = false;
    this.charsStrippedInEmailOnly = false;
  }

  toggleSection(section: 'dados' | 'detalhes' | 'mensagem'): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  isSectionExpanded(section: 'dados' | 'detalhes' | 'mensagem'): boolean {
    return this.expandedSections[section];
  }

  isFieldInvalid(key: QuoteFieldKey): boolean {
    return this.invalidFields.has(key);
  }

  isFormValid(): boolean {
    return !!(
      this.form.name?.trim() &&
      this.form.email?.trim() &&
      this.form.phone1?.trim() &&
      this.form.origin?.trim() &&
      this.form.destination?.trim() &&
      this.form.deliveryMethod &&
      this.form.message?.trim()
    );
  }

  getMissingFields(): string[] {
    return this.getMissingFieldsWithKeys().map(x => x.label);
  }

  getMissingFieldsWithKeys(): { key: QuoteFieldKey; label: string }[] {
    const t = (k: string) => this.transloco.translate(k);
    const out: { key: QuoteFieldKey; label: string }[] = [];
    if (!this.form.name?.trim()) out.push({ key: 'name', label: t('quotePage.missingName') });
    if (!this.form.email?.trim()) out.push({ key: 'email', label: t('quotePage.missingEmail') });
    if (!this.form.phone1?.trim()) out.push({ key: 'phone1', label: t('quotePage.missingPhone') });
    if (!this.form.origin?.trim()) out.push({ key: 'origin', label: t('quotePage.missingOrigin') });
    if (!this.form.destination?.trim()) out.push({ key: 'destination', label: t('quotePage.missingDest') });
    if (!this.form.deliveryMethod) out.push({ key: 'deliveryMethod', label: t('quotePage.missingContactPref') });
    if (!this.form.message?.trim()) out.push({ key: 'message', label: t('quotePage.missingMessage') });
    return out;
  }

  private getMissingKeys(): QuoteFieldKey[] {
    return this.getMissingFieldsWithKeys().map(x => x.key);
  }

  private expandSectionsForKeys(keys: QuoteFieldKey[]): void {
    const needDados = keys.some(k => ['name', 'email', 'phone1'].includes(k));
    const needDetalhes = keys.some(k => ['origin', 'destination', 'deliveryMethod'].includes(k));
    const needMsg = keys.includes('message');
    if (needDados) this.expandedSections.dados = true;
    if (needDetalhes) this.expandedSections.detalhes = true;
    if (needMsg) this.expandedSections.mensagem = true;
  }

  /** Abre o assistente, realça campos e faz scroll ao primeiro. */
  openValidationAssistant(): void {
    const keys = this.getMissingKeys();
    this.invalidFields = new Set(keys);
    this.expandSectionsForKeys(keys);
    this.validationModalOpen = true;
    this.errorKey = '';
  }

  closeValidationModal(): void {
    this.validationModalOpen = false;
  }

  /** Fecha o assistente, expande a secção e foca o campo (scroll suave). */
  focusFieldKey(key: QuoteFieldKey): void {
    const idMap: Record<QuoteFieldKey, string> = {
      name: 'name',
      email: 'email',
      phone1: 'phone1',
      origin: 'origin',
      destination: 'destination',
      deliveryMethod: 'deliveryMethod',
      message: 'message'
    };
    this.validationModalOpen = false;
    this.expandSectionsForKeys([key]);
    const id = idMap[key];
    setTimeout(() => {
      const node = document.getElementById(id);
      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (node as HTMLElement | null)?.focus?.();
    }, 100);
  }

  onFormSubmit(e: Event): void {
    e.preventDefault();
    if (this.isFormValid()) {
      this.openConfirmacao();
    } else {
      this.openValidationAssistant();
    }
  }

  openConfirmacao(): void {
    if (!this.isFormValid()) return;
    this.errorKey = '';
    this.invalidFields.clear();
    this.confirmacaoOpen = true;
  }

  closeConfirmacao(): void {
    this.confirmacaoOpen = false;
  }

  doSubmit(): void {
    if (!this.isFormValid()) return;
    this.loading = true;
    this.confirmacaoOpen = false;

    this.cotacaoService.criarPedidoPortal({
      nome: this.form.name,
      email: this.form.email,
      telefone1: this.form.phone1,
      hasWhatsApp1: this.form.deliveryMethod === 'whatsapp',
      origem: this.form.origin,
      destino: this.form.destination,
      mensagem: this.form.message,
      formaEnvioPreferida: this.form.deliveryMethod as FormaEnvio,
      tipoServico: this.form.tipoServico
    }).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        this.invalidFields.clear();
        this.charsStrippedOutsideEmail = false;
        this.charsStrippedInEmailOnly = false;
      },
      error: () => {
        this.loading = false;
        this.errorKey = 'quotePage.errorSend';
      }
    });
  }

  getDeliveryLabel(): string {
    const m = this.form.deliveryMethod;
    if (m === 'whatsapp') return this.transloco.translate('quotePage.labelWhatsapp');
    if (m === 'email') return this.transloco.translate('quotePage.labelEmail');
    if (m === 'chamada') return this.transloco.translate('quotePage.labelCall');
    return m;
  }

  getTipoServicoLabel(): string {
    return this.form.tipoServico === 'COMPRA_TRANSPORTE'
      ? this.transloco.translate('quotePage.labelBuyTransport')
      : this.transloco.translate('quotePage.labelTransportOnly');
  }
}
