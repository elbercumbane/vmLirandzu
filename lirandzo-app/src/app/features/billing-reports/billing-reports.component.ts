import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingSidebarComponent } from '../../shared/billing-sidebar/billing-sidebar.component';

type PeriodOption = 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_3_MONTHS' | 'THIS_YEAR' | 'CUSTOM';

interface DebtRow {
  customerName: string;
  phone: string;
  ordersWithDebt: number;
  totalDebt: number;
  oldestDate: string;
}

interface ManagerRow {
  manager: string;
  orders: number;
  invoiced: number;
  received: number;
  debt: number;
  receiptRate: number;
  trips: number;
}

interface TripRow {
  tripId: string;
  manager: string;
  period: string;
  orders: number;
  valueTransported: number;
  received: number;
  toReceive: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
}

@Component({
  selector: 'app-billing-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSidebarComponent],
  templateUrl: './billing-reports.component.html',
  styleUrl: './billing-reports.component.css'
})
export class BillingReportsComponent {
  sidebarOpen = false;

  // Period selection
  selectedPeriod: PeriodOption = 'THIS_MONTH';
  customDateFrom = '';
  customDateTo = '';
  currentPeriodText = 'Janeiro 2025';

  // Financial summary KPIs
  totalInvoiced = 285400;
  totalReceived = 198750;
  totalDebt = 86650;
  totalOrders = 47;
  averageTicket = 6072;
  receiptRate = 69.6;

  // Monthly evolution data (for line chart)
  monthlyData = [
    { month: 'Jan', invoiced: 285400, received: 198750, debt: 86650 },
    { month: 'Fev', invoiced: 0, received: 0, debt: 0 },
    { month: 'Mar', invoiced: 0, received: 0, debt: 0 },
    { month: 'Abr', invoiced: 0, received: 0, debt: 0 },
    { month: 'Mai', invoiced: 0, received: 0, debt: 0 },
    { month: 'Jun', invoiced: 0, received: 0, debt: 0 },
    { month: 'Jul', invoiced: 0, received: 0, debt: 0 },
    { month: 'Ago', invoiced: 0, received: 0, debt: 0 },
    { month: 'Set', invoiced: 0, received: 0, debt: 0 },
    { month: 'Out', invoiced: 0, received: 0, debt: 0 },
    { month: 'Nov', invoiced: 0, received: 0, debt: 0 },
    { month: 'Dez', invoiced: 0, received: 0, debt: 0 }
  ];

  // Top products data (for horizontal bar chart)
  topProducts = [
    { name: 'Electrónicos', orders: 18 },
    { name: 'Roupas & Calçado', orders: 12 },
    { name: 'Electrodomésticos', orders: 8 },
    { name: 'Móveis', orders: 5 },
    { name: 'Outros', orders: 4 }
  ];

  // Debts table
  debts: DebtRow[] = [
    { customerName: 'Carlos Mondlane', phone: '084567123', ordersWithDebt: 1, totalDebt: 18500, oldestDate: '05/01' },
    { customerName: 'Fátima Cossa', phone: '872341567', ordersWithDebt: 1, totalDebt: 12800, oldestDate: '07/01' },
    { customerName: 'Maria Machava', phone: '821456789', ordersWithDebt: 1, totalDebt: 8300, oldestDate: '11/01' },
    { customerName: 'Lurdes Sitoe', phone: '853671234', ordersWithDebt: 1, totalDebt: 29400, oldestDate: '14/01' },
    { customerName: 'Domingos Cuamba', phone: '845678321', ordersWithDebt: 1, totalDebt: 33900, oldestDate: '18/01' }
  ];

  // Managers table
  managers: ManagerRow[] = [
    { manager: 'Ana Silva', orders: 18, invoiced: 112350, received: 89200, debt: 23150, receiptRate: 79, trips: 2 },
    { manager: 'Carlos Matos', orders: 16, invoiced: 98700, received: 72400, debt: 26300, receiptRate: 73, trips: 1 },
    { manager: 'Maria João', orders: 13, invoiced: 74350, received: 37150, debt: 37200, receiptRate: 50, trips: 1 }
  ];

  // Trips table
  trips: TripRow[] = [
    { tripId: 'VGM-001', manager: 'Ana Silva', period: '02-06 Jan', orders: 13, valueTransported: 96500, received: 71200, toReceive: 25300, status: 'COMPLETED' },
    { tripId: 'VGM-002', manager: 'Carlos Matos', period: '09-13 Jan', orders: 14, valueTransported: 119200, received: 82400, toReceive: 36800, status: 'COMPLETED' },
    { tripId: 'VGM-003', manager: 'Maria João', period: '16-20 Jan', orders: 12, valueTransported: 78900, received: 45150, toReceive: 33750, status: 'IN_PROGRESS' },
    { tripId: 'VGM-004', manager: 'Ana Silva', period: '23-27 Jan', orders: 8, valueTransported: 113800, received: 0, toReceive: 113800, status: 'PLANNED' }
  ];

  // Chart calculations
  get maxMonthlyValue(): number {
    return Math.max(...this.monthlyData.map(d => Math.max(d.invoiced, d.received, d.debt)));
  }

  get maxProductOrders(): number {
    return Math.max(...this.topProducts.map(p => p.orders));
  }

  getLineY(value: number, maxValue: number, height: number): number {
    if (maxValue === 0) return height;
    return height - (value / maxValue) * (height - 40);
  }

  getBarWidth(orders: number, maxOrders: number, width: number): number {
    if (maxOrders === 0) return 0;
    return (orders / maxOrders) * (width - 180);
  }

  getReceiptRateColor(rate: number): string {
    if (rate >= 80) return '#22C55E';
    if (rate >= 50) return '#EAB308';
    return '#EF4444';
  }

  // Line chart point generators
  getInvoicedLinePoints(): string {
    const points = this.monthlyData.map((d, i) => {
      const x = 50 + i * 45;
      const y = this.getLineY(d.invoiced, this.maxMonthlyValue, 220);
      return `${x},${y}`;
    });
    return points.join(' ');
  }

  getReceivedLinePoints(): string {
    const points = this.monthlyData.map((d, i) => {
      const x = 50 + i * 45;
      const y = this.getLineY(d.received, this.maxMonthlyValue, 220);
      return `${x},${y}`;
    });
    return points.join(' ');
  }

  getDebtLinePoints(): string {
    const points = this.monthlyData.map((d, i) => {
      const x = 50 + i * 45;
      const y = this.getLineY(d.debt, this.maxMonthlyValue, 220);
      return `${x},${y}`;
    });
    return points.join(' ');
  }

  // Manager totals (for table footer)
  get totalManagerOrders(): number {
    return this.managers.reduce((sum, m) => sum + m.orders, 0);
  }

  get totalManagerInvoiced(): number {
    return this.managers.reduce((sum, m) => sum + m.invoiced, 0);
  }

  get totalManagerReceived(): number {
    return this.managers.reduce((sum, m) => sum + m.received, 0);
  }

  get totalManagerDebt(): number {
    return this.managers.reduce((sum, m) => sum + m.debt, 0);
  }

  get totalManagerTrips(): number {
    return this.managers.reduce((sum, m) => sum + m.trips, 0);
  }

  formatYAxisValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return Math.round(value).toString();
  }

  applyPeriod(): void {
    // In a real app, this would filter the data
    // For now, just update the period text
    if (this.selectedPeriod === 'THIS_MONTH') {
      this.currentPeriodText = 'Janeiro 2025';
    } else if (this.selectedPeriod === 'LAST_MONTH') {
      this.currentPeriodText = 'Dezembro 2024';
    } else if (this.selectedPeriod === 'LAST_3_MONTHS') {
      this.currentPeriodText = 'Novembro 2024 - Janeiro 2025';
    } else if (this.selectedPeriod === 'THIS_YEAR') {
      this.currentPeriodText = '2025';
    } else if (this.selectedPeriod === 'CUSTOM' && this.customDateFrom && this.customDateTo) {
      this.currentPeriodText = `${this.customDateFrom} - ${this.customDateTo}`;
    }
  }

  exportReport(type: string): void {
    // Simulate export
    console.log(`Exporting ${type}...`);
    // In a real app, this would generate and download the file
    alert(`✓ Relatório ${type} gerado com sucesso!`);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
