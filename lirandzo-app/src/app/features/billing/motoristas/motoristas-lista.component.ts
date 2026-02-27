import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-motoristas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './motoristas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-lista.component.css']
})
export class MotoristasListaComponent {
  searchTerm = '';
  activeFilter = 'TODOS';

  motoristas = [
    { id: 1, nome: 'João Macuácua', telefone: '841234567', carta: 'C+E', viaturaAtribuida: 'MDD-45-78 (Volvo FH16)', totalViagens: 45, avaliacao: 4.8, status: 'DISPONÍVEL' },
    { id: 2, nome: 'Alberto Chissano', telefone: '852345678', carta: 'C+E', viaturaAtribuida: 'MPT-12-34 (Scania R450)', totalViagens: 38, avaliacao: 4.5, status: 'EM VIAGEM' },
    { id: 3, nome: 'Samuel Dinis', telefone: '863456789', carta: 'C', viaturaAtribuida: 'MTT-67-89 (Isuzu NPR)', totalViagens: 22, avaliacao: 4.2, status: 'DISPONÍVEL' },
    { id: 4, nome: 'Mário Tembe', telefone: '874567890', carta: 'C+E', viaturaAtribuida: 'MNP-56-90 (Iveco Stralis)', totalViagens: 51, avaliacao: 4.9, status: 'EM VIAGEM' },
    { id: 5, nome: 'Fernando Langa', telefone: '885678901', carta: 'C', viaturaAtribuida: '—', totalViagens: 15, avaliacao: 3.8, status: 'FÉRIAS' },
    { id: 6, nome: 'Hélder Cuna', telefone: '896789012', carta: 'C+E', viaturaAtribuida: '—', totalViagens: 33, avaliacao: 4.0, status: 'INACTIVO' }
  ];

  get filteredMotoristas() {
    let list = this.motoristas;
    if (this.activeFilter !== 'TODOS') list = list.filter(m => m.status === this.activeFilter);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(m => m.nome.toLowerCase().includes(term) || m.telefone.includes(term));
    }
    return list;
  }

  get totalMotoristas() { return this.motoristas.length; }
  get disponiveis() { return this.motoristas.filter(m => m.status === 'DISPONÍVEL').length; }
  get emViagem() { return this.motoristas.filter(m => m.status === 'EM VIAGEM').length; }
  get avaliacaoMedia() {
    const sum = this.motoristas.reduce((a, m) => a + m.avaliacao, 0);
    return (sum / this.motoristas.length).toFixed(1);
  }

  setFilter(f: string) { this.activeFilter = f; }
}
