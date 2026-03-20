import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CotacaoPortalRequest, CotacaoService } from '../../services/cotacao.service';

type FormaEnvio = CotacaoPortalRequest['formaEnvioPreferida'];

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-quote.component.html',
  styleUrl: './request-quote.component.css'
})
export class RequestQuoteComponent {
  submitted = false;
  loading = false;
  error = '';
  confirmacaoOpen = false;
  expandedSections: Record<'dados' | 'detalhes' | 'mensagem', boolean> = {
    dados: true,
    detalhes: false,
    mensagem: false
  };
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

  constructor(private cotacaoService: CotacaoService) {}

  /** Organiza o texto do campo mensagem em lista numerada (1. 2. 3.) para facilitar a análise. */
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
  }

  toggleSection(section: 'dados' | 'detalhes' | 'mensagem'): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  isSectionExpanded(section: 'dados' | 'detalhes' | 'mensagem'): boolean {
    return this.expandedSections[section];
  }

  /** Verifica se todos os campos obrigatórios estão preenchidos. */
  isFormValid(): boolean {
    const phone1 = this.form.phone1?.trim() || '';
    const deliveryMethod = this.form.deliveryMethod;
    const needsPhone = deliveryMethod === 'whatsapp' || deliveryMethod === 'chamada';
    return !!(
      this.form.name?.trim() &&
      this.form.email?.trim() &&
      (!needsPhone || phone1) &&
      this.form.origin?.trim() &&
      this.form.destination?.trim() &&
      this.form.deliveryMethod
    );
  }

  /** Retorna lista de campos obrigatórios em falta. */
  getMissingFields(): string[] {
    const missing: string[] = [];
    if (!this.form.name?.trim()) missing.push('Nome');
    if (!this.form.email?.trim()) missing.push('E-mail');
    const phone1 = this.form.phone1?.trim() || '';
    const needsPhone = this.form.deliveryMethod === 'whatsapp' || this.form.deliveryMethod === 'chamada';
    if (needsPhone && !phone1) missing.push('Telefone');
    if (!this.form.origin?.trim()) missing.push('Origem');
    if (!this.form.destination?.trim()) missing.push('Destino');
    if (!this.form.deliveryMethod) missing.push('Preferência de contacto');
    return missing;
  }

  onFormSubmit(e: Event): void {
    e.preventDefault();
    if (this.isFormValid()) this.openConfirmacao();
  }

  /** Abre o popup de confirmação (quando o formulário está válido). */
  openConfirmacao(): void {
    if (!this.isFormValid()) return;
    this.error = '';
    this.confirmacaoOpen = true;
  }

  closeConfirmacao(): void {
    this.confirmacaoOpen = false;
  }

  /** Submete efectivamente após confirmação. */
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
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível enviar o pedido de cotação. Tente novamente mais tarde.';
      }
    });
  }

  /** Labels para exibir no resumo. */
  getDeliveryLabel(): string {
    const m: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', chamada: 'Chamada telefónica' };
    return m[this.form.deliveryMethod] || this.form.deliveryMethod;
  }
  getTipoServicoLabel(): string {
    return this.form.tipoServico === 'COMPRA_TRANSPORTE' ? 'Compra + transporte' : 'Apenas transporte';
  }
}
