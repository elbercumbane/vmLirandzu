import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, BillingSectionHeaderComponent],
  templateUrl: './billing-dashboard.component.html',
  styleUrls: ['../shared/billing-page.css', './billing-dashboard.component.css']
})
export class BillingDashboardComponent {
  Math = Math;

  // Monthly chart data
  monthlyRevenue = [
    { month: 'Out', receita: 185000, despesa: 72000 },
    { month: 'Nov', receita: 220000, despesa: 85000 },
    { month: 'Dez', receita: 198000, despesa: 91000 },
    { month: 'Jan', receita: 285400, despesa: 102500 }
  ];

  // Trips by vehicle
  tripsByVehicle = [
    { viatura: 'Volvo FH16', viagens: 12, cor: '#F97316' },
    { viatura: 'Scania R450', viagens: 9, cor: '#3B82F6' },
    { viatura: 'Iveco Stralis', viagens: 8, cor: '#22C55E' },
    { viatura: 'Isuzu NPR', viagens: 6, cor: '#EAB308' },
    { viatura: 'Mercedes Actros', viagens: 4, cor: '#8B5CF6' }
  ];

  // Debt alerts
  debtAlerts = [
    { cliente: 'Fátima Cossa', telefone: '872341567', valor: 12800, dias: 18 },
    { cliente: 'Lurdes Sitoe', telefone: '853671234', valor: 29400, dias: 11 },
    { cliente: 'Domingos Cuamba', telefone: '845678321', valor: 33900, dias: 8 }
  ];

  // Top drivers (array estático original)
  topDrivers = [
    { nome: 'Mário Tembe', viagens: 51, avaliacao: 4.9 },
    { nome: 'João Macuácua', viagens: 45, avaliacao: 4.8 },
    { nome: 'Alberto Chissano', viagens: 38, avaliacao: 4.5 }
  ];

  get maxTrips(): number {
    return Math.max(...this.tripsByVehicle.map(v => v.viagens));
  }

  get totalDebt(): number {
    return this.debtAlerts.reduce((s, a) => s + a.valor, 0);
  }

  getBarWidth(value: number): number {
    return (value / this.maxTrips) * 100;
  }

  getRevenueBarHeight(value: number): number {
    const max = Math.max(...this.monthlyRevenue.map(m => Math.max(m.receita, m.despesa)));
    return (value / max) * 140;
  }
}
