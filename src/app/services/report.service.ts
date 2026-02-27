import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Order, OrderStatus } from '../models/order.model';

export interface MonthlyReport {
  month: string;
  totalOrders: number;
  totalInvoiced: number;
  totalReceived: number;
  totalDebt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private storage: StorageService) {}

  getOrders(): Order[] {
    return this.storage.getOrders();
  }

  getMonthlyReport(year: number): MonthlyReport[] {
    const orders = this.getOrders().filter(o => new Date(o.registrationDate).getFullYear() === year);
    const byMonth: { [key: number]: MonthlyReport } = {};

    orders.forEach(o => {
      const date = new Date(o.registrationDate);
      const m = date.getMonth();
      if (!byMonth[m]) {
        byMonth[m] = {
          month: `${String(m + 1).padStart(2, '0')}/${year}`,
          totalOrders: 0,
          totalInvoiced: 0,
          totalReceived: 0,
          totalDebt: 0
        };
      }
      const rpt = byMonth[m];
      rpt.totalOrders += 1;
      rpt.totalInvoiced += o.totalValueMZN;
      rpt.totalReceived += o.paidAmount;
      rpt.totalDebt += o.debtBalance;
    });

    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  }

  getDebtOpenOrders(): Order[] {
    return this.getOrders().filter(o => o.debtBalance > 0 && o.status !== OrderStatus.CANCELLED);
  }

  exportOrdersToCSV(orders: Order[]): string {
    const headers = [
      'Numero', 'Data', 'Cliente', 'Telefone', 'Total MZN',
      'Pago MZN', 'Divida MZN', 'Status', 'Gestor', 'Viagem'
    ];

    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.registrationDate).toLocaleDateString(),
      o.customerName,
      o.customerPhone,
      o.totalValueMZN.toFixed(2),
      o.paidAmount.toFixed(2),
      o.debtBalance.toFixed(2),
      o.status,
      o.responsibleManager,
      o.tripId || ''
    ]);

    return [headers, ...rows].map(r => r.map(this.escape).join(',')).join('\n');
  }

  private escape(value: string): string {
    const v = value ?? '';
    if (v.includes(',') || v.includes('"')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  }
}

