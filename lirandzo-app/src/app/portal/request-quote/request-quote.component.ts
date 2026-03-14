import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-quote.component.html',
  styleUrl: './request-quote.component.css'
})
export class RequestQuoteComponent {
  submitted = false;
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
    message: ''
  };

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
    this.submitted = true;
  }
}
