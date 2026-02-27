import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viaturas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viaturas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-lista.component.css']
})
export class ViaturasListaComponent {
  searchTerm = '';
  activeFilter = 'TODOS';

  viaturas = [
    { id: 1, matricula: 'MDD-45-78', marca: 'Volvo FH16', tipo: 'Camião Pesado', ano: 2021, kmActual: 125400, ultimaManutencao: '15/01/2025', proximaManutencao: '15/04/2025', consumoMedio: 32, status: 'OPERACIONAL' },
    { id: 2, matricula: 'MPT-12-34', marca: 'Scania R450', tipo: 'Camião Pesado', ano: 2020, kmActual: 198700, ultimaManutencao: '02/01/2025', proximaManutencao: '02/03/2025', consumoMedio: 35, status: 'OPERACIONAL' },
    { id: 3, matricula: 'MBR-89-12', marca: 'Mercedes Actros', tipo: 'Camião Médio', ano: 2019, kmActual: 245300, ultimaManutencao: '20/12/2024', proximaManutencao: '20/02/2025', consumoMedio: 28, status: 'MANUTENÇÃO' },
    { id: 4, matricula: 'MNP-56-90', marca: 'Iveco Stralis', tipo: 'Camião Pesado', ano: 2022, kmActual: 87200, ultimaManutencao: '10/01/2025', proximaManutencao: '10/04/2025', consumoMedio: 30, status: 'OPERACIONAL' },
    { id: 5, matricula: 'MGZ-23-45', marca: 'DAF XF', tipo: 'Camião Pesado', ano: 2018, kmActual: 312500, ultimaManutencao: '05/11/2024', proximaManutencao: '05/02/2025', consumoMedio: 38, status: 'PARADO' },
    { id: 6, matricula: 'MTT-67-89', marca: 'Isuzu NPR', tipo: 'Camião Leve', ano: 2023, kmActual: 34600, ultimaManutencao: '25/01/2025', proximaManutencao: '25/04/2025', consumoMedio: 18, status: 'OPERACIONAL' }
  ];

  get filteredViaturas() {
    let list = this.viaturas;
    if (this.activeFilter !== 'TODOS') list = list.filter(v => v.status === this.activeFilter);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(v => v.matricula.toLowerCase().includes(term) || v.marca.toLowerCase().includes(term));
    }
    return list;
  }

  get totalViaturas() { return this.viaturas.length; }
  get operacionais() { return this.viaturas.filter(v => v.status === 'OPERACIONAL').length; }
  get emManutencao() { return this.viaturas.filter(v => v.status === 'MANUTENÇÃO').length; }
  get consumoMedioGeral() {
    const total = this.viaturas.reduce((s, v) => s + v.consumoMedio, 0);
    return this.viaturas.length ? (total / this.viaturas.length).toFixed(1) : '0';
  }

  setFilter(f: string) { this.activeFilter = f; }
}
