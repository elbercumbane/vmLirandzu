import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CargaViagem {
  cliente: string;
  descricao: string;
  quantidade: number;
  peso: string;
  encomendaRef: string;
  observacao: string;
}

@Component({
  selector: 'app-viagens-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viagens-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-cadastro.component.css']
})
export class ViagensCadastroComponent {
  viagem = {
    motorista: '',
    viatura: '',
    origem: '',
    destino: '',
    dataSaida: '',
    dataChegadaPrevista: '',
    observacoes: ''
  };

  cargas: CargaViagem[] = [
    { cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '', observacao: '' }
  ];

  motoristasDisponiveis = ['João Macuácua', 'Alberto Chissano', 'Samuel Dinis', 'Mário Tembe'];
  viaturasDisponiveis = ['MDD-45-78 (Volvo FH16)', 'MPT-12-34 (Scania R450)', 'MNP-56-90 (Iveco Stralis)', 'MTT-67-89 (Isuzu NPR)'];

  adicionarCarga(): void {
    this.cargas.push({ cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '', observacao: '' });
  }

  removerCarga(index: number): void {
    if (this.cargas.length > 1) this.cargas.splice(index, 1);
  }

  salvar(): void {
    console.log('Salvar viagem:', { viagem: this.viagem, cargas: this.cargas });
  }
}
