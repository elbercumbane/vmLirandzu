import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingSidebarComponent } from '../../shared/billing-sidebar/billing-sidebar.component';
import { DashboardNavbarComponent } from '../../shared/dashboard-navbar/dashboard-navbar.component';

interface RecentOrder {
  number: string;
  customerName: string;
  customerPhone: string;
  product: string;
  total: number;
  paid: number;
  debt: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';
  date: string;
}

type OrderFilter = 'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID';

interface DebtAlert {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  product: string;
  daysOverdue: number;
  debtAmount: number;
  severity: 'URGENT' | 'WARNING';
}

@Component({
  selector: 'app-billing-admin',
  standalone: true,
  imports: [CommonModule, BillingSidebarComponent, DashboardNavbarComponent],
  templateUrl: './billing-admin.component.html',
  styleUrl: './billing-admin.component.css'
})
export class BillingAdminComponent {
  recentOrders: RecentOrder[] = [
    { number: 'VML-2025-0001', customerName: 'Ana Rodrigues', customerPhone: '054212348', product: 'iPhone 15 Pro 256GB', total: 45200, paid: 45200, debt: 0, status: 'PAID', date: '02/01/2025' },
    { number: 'VML-2025-0002', customerName: 'Carlos Mondlane', customerPhone: '084567123', product: 'Samsung TV 55\" 4K', total: 38500, paid: 20000, debt: 18500, status: 'PARTIAL', date: '05/01/2025' },
    { number: 'VML-2025-0003', customerName: 'Fátima Cossa', customerPhone: '872341567', product: 'Nike Air Max + Adidas', total: 12800, paid: 0, debt: 12800, status: 'UNPAID', date: '07/01/2025' },
    { number: 'VML-2025-0004', customerName: 'José Tembe', customerPhone: '843219876', product: 'Laptop Lenovo IdeaPad', total: 52000, paid: 52000, debt: 0, status: 'PAID', date: '09/01/2025' },
    { number: 'VML-2025-0005', customerName: 'Maria Machava', customerPhone: '821456789', product: 'Máquina de costura Singer', total: 18300, paid: 10000, debt: 8300, status: 'PARTIAL', date: '11/01/2025' },
    { number: 'VML-2025-0006', customerName: 'Pedro Nhantumbo', customerPhone: '864523178', product: 'PlayStation 5 + 2 jogos', total: 41600, paid: 41600, debt: 0, status: 'PAID', date: '12/01/2025' },
    { number: 'VML-2025-0007', customerName: 'Lurdes Sitoe', customerPhone: '853671234', product: 'Frigorífico Samsung', total: 29400, paid: 0, debt: 29400, status: 'UNPAID', date: '14/01/2025' },
    { number: 'VML-2025-0008', customerName: 'António Bila', customerPhone: '874123456', product: 'Roupas várias (5 peças)', total: 8750, paid: 8750, debt: 0, status: 'PAID', date: '15/01/2025' },
    { number: 'VML-2025-0009', customerName: 'Rosa Mahumane', customerPhone: '861234987', product: 'Microondas + Air Fryer', total: 15200, paid: 8000, debt: 7200, status: 'PARTIAL', date: '17/01/2025' },
    { number: 'VML-2025-0010', customerName: 'Domingos Cuamba', customerPhone: '845678321', product: 'Bicicleta eléctrica', total: 33900, paid: 0, debt: 33900, status: 'UNPAID', date: '18/01/2025' }
  ];

  activeFilter: OrderFilter = 'ALL';

  get filteredOrders(): RecentOrder[] {
    if (this.activeFilter === 'ALL') {
      return this.recentOrders;
    }
    if (this.activeFilter === 'PAID') {
      return this.recentOrders.filter(o => o.status === 'PAID');
    }
    if (this.activeFilter === 'PARTIAL') {
      return this.recentOrders.filter(o => o.status === 'PARTIAL');
    }
    if (this.activeFilter === 'UNPAID') {
      return this.recentOrders.filter(o => o.status === 'UNPAID');
    }
    return this.recentOrders;
  }

  get paidCount(): number {
    return this.recentOrders.filter(o => o.status === 'PAID').length;
  }

  get partialCount(): number {
    return this.recentOrders.filter(o => o.status === 'PARTIAL').length;
  }

  get unpaidCount(): number {
    return this.recentOrders.filter(o => o.status === 'UNPAID').length;
  }

  get totalCount(): number {
    return this.recentOrders.length;
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter = filter;
  }

  truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  // Chart data
  weeklyOrdersData = [
    { week: 'Semana 1', weekRange: '(01–07 Jan)', paid: 8, partial: 3, unpaid: 2, total: 13 },
    { week: 'Semana 2', weekRange: '(08–14 Jan)', paid: 10, partial: 4, unpaid: 3, total: 17 },
    { week: 'Semana 3', weekRange: '(15–21 Jan)', paid: 7, partial: 2, unpaid: 4, total: 13 },
    { week: 'Semana 4', weekRange: '(22–28 Jan)', paid: 6, partial: 3, unpaid: 2, total: 11 }
  ];

  statusDistributionData = [
    { name: 'PAGO', value: 31, color: '#22C55E' },
    { name: 'PARCIAL', value: 9, color: '#EAB308' },
    { name: 'NÃO PAGO', value: 7, color: '#EF4444' }
  ];

  get totalOrders(): number {
    return this.statusDistributionData.reduce((sum, item) => sum + item.value, 0);
  }

  getStatusPercentage(value: number): number {
    return Math.round((value / this.totalOrders) * 100);
  }

  Math = Math;

  get maxBarValue(): number {
    return Math.max(...this.weeklyOrdersData.map(d => d.total));
  }

  getBarHeight(value: number, max: number): number {
    return (value / max) * 150;
  }

  getBarY(value: number, max: number): number {
    return 180 - this.getBarHeight(value, max);
  }

  getPiePath(index: number, total: number): string {
    const data = this.statusDistributionData;
    let currentAngle = -90;
    for (let i = 0; i < index; i++) {
      currentAngle += (data[i].value / total) * 360;
    }
    const angle = (data[index].value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const startAngleRad = startAngle * (Math.PI / 180);
    const endAngleRad = endAngle * (Math.PI / 180);
    const cx = 150;
    const cy = 110;
    const outerRadius = 90;
    const innerRadius = 55;
    const x1 = cx + outerRadius * Math.cos(startAngleRad);
    const y1 = cy + outerRadius * Math.sin(startAngleRad);
    const x2 = cx + outerRadius * Math.cos(endAngleRad);
    const y2 = cy + outerRadius * Math.sin(endAngleRad);
    const x3 = cx + innerRadius * Math.cos(endAngleRad);
    const y3 = cy + innerRadius * Math.sin(endAngleRad);
    const x4 = cx + innerRadius * Math.cos(startAngleRad);
    const y4 = cy + innerRadius * Math.sin(startAngleRad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // Debt alerts data
  debtAlerts: DebtAlert[] = [
    {
      orderNumber: 'VML-2025-0003',
      customerName: 'Fátima Cossa',
      customerPhone: '872341567',
      product: 'Nike Air Max + Adidas',
      daysOverdue: 18,
      debtAmount: 12800,
      severity: 'URGENT'
    },
    {
      orderNumber: 'VML-2025-0007',
      customerName: 'Lurdes Sitoe',
      customerPhone: '853671234',
      product: 'Frigorífico Samsung',
      daysOverdue: 11,
      debtAmount: 29400,
      severity: 'URGENT'
    },
    {
      orderNumber: 'VML-2025-0010',
      customerName: 'Domingos Cuamba',
      customerPhone: '845678321',
      product: 'Bicicleta eléctrica',
      daysOverdue: 8,
      debtAmount: 33900,
      severity: 'WARNING'
    }
  ];

  get totalCriticalDebt(): number {
    return this.debtAlerts.reduce((sum, alert) => sum + alert.debtAmount, 0);
  }

  get urgentAlertsCount(): number {
    return this.debtAlerts.length;
  }

  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

