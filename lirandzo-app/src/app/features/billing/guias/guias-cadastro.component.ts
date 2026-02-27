import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

interface CargaGuia {
  cliente: string;
  descricao: string;
  quantidade: number;
  peso: string;
  encomendaRef: string;
}

@Component({
  selector: 'app-guias-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './guias-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './guias-cadastro.component.css']
})
export class GuiasCadastroComponent {
  guia = {
    referencia: 'GR-2025-' + String(Math.floor(Math.random() * 900) + 100),
    data: new Date().toISOString().split('T')[0],
    motorista: '',
    viatura: '',
    origem: '',
    destino: '',
    kmSaida: null as number | null,
    observacoes: ''
  };

  cargas: CargaGuia[] = [
    { cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '' }
  ];

  motoristasDisponiveis = ['João Macuácua', 'Alberto Chissano', 'Samuel Dinis', 'Mário Tembe', 'Carlos Sitoe'];
  viaturasDisponiveis = ['MDD-45-78 (Volvo FH16)', 'MPT-12-34 (Scania R450)', 'MNP-56-90 (Iveco Stralis)', 'MTT-67-89 (Isuzu NPR)', 'MBR-89-12 (Mercedes Actros)'];

  adicionarCarga(): void {
    this.cargas.push({ cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '' });
  }

  removerCarga(i: number): void {
    if (this.cargas.length > 1) this.cargas.splice(i, 1);
  }

  gerarGuia(): void {
    console.log('Gerar guia de remessa:', { guia: this.guia, cargas: this.cargas });
    alert('Guia de Remessa ' + this.guia.referencia + ' gerada com sucesso!');
  }

  baixarGuia(): void {
    alert('Download da guia será implementado com geração PDF.');
  }
}
