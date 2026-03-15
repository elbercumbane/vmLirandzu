import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CotacaoService } from '../../services/cotacao.service';

type FormaEnvio = 'whatsapp' | 'pdf' | 'chamada';

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
  addressesModalOpen = true;
  form = {
    name: '',
    email: '',
    phone1: '',
    hasWhatsApp1: '' as '' | 'sim' | 'nao',
    phone2: '',
    hasWhatsApp2: '' as '' | 'sim' | 'nao',
    origin: '',
    destination: '',
    message: '',
    deliveryMethod: '' as '' | FormaEnvio
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

  toggleAddressesModal(): void {
    this.addressesModalOpen = !this.addressesModalOpen;
  }

  closeAddressesModal(): void {
    this.addressesModalOpen = false;
  }

  onSubmit(): void {
    this.error = '';
    if (!this.form.name || !this.form.email || !this.form.origin || !this.form.destination) {
      this.error = 'Por favor preencha nome, e-mail, origem e destino.';
      return;
    }
    if (!this.form.deliveryMethod) {
      this.error = 'Por favor indique como deseja receber a cotação.';
      return;
    }

    this.loading = true;

    this.cotacaoService.criarPedidoPortal({
      nome: this.form.name,
      email: this.form.email,
      telefone1: this.form.phone1,
      hasWhatsApp1: this.form.hasWhatsApp1 === 'sim',
      telefone2: this.form.phone2,
      hasWhatsApp2: this.form.hasWhatsApp2 === 'sim',
      origem: this.form.origin,
      destino: this.form.destination,
      mensagem: this.form.message,
      formaEnvioPreferida: this.form.deliveryMethod
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
}
