import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingSidebarComponent } from '../layout/billing-sidebar/billing-sidebar.component';

type OrderStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';

interface OrderRow {
  number: string;
  customerName: string;
  customerPhone: string;
  product: string;
  zarAmount: number;
  exchangeRate: number;
  totalMzn: number;
  paidMzn: number;
  debtMzn: number;
  tripId: string | null;
  status: OrderStatus;
  date: string; // 'DD/MM'
  manager: string;
}

type StatusFilter = 'ALL' | OrderStatus;

@Component({
  selector: 'app-billing-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSidebarComponent],
  templateUrl: './billing-orders.component.html',
  styleUrl: './billing-orders.component.css'
})
export class BillingOrdersComponent {
  orders: OrderRow[] = [
    { number: 'VML-2025-0001', customerName: 'Ana Rodrigues', customerPhone: '054212348', product: 'iPhone 15 Pro 256GB', zarAmount: 2400, exchangeRate: 3.8, totalMzn: 45200, paidMzn: 45200, debtMzn: 0, tripId: 'VGM-001', status: 'PAID', date: '02/01', manager: 'Ana Silva' },
    { number: 'VML-2025-0002', customerName: 'Carlos Mondlane', customerPhone: '084567123', product: 'Samsung TV 55\" 4K', zarAmount: 2026, exchangeRate: 3.8, totalMzn: 38500, paidMzn: 20000, debtMzn: 18500, tripId: 'VGM-001', status: 'PARTIAL', date: '05/01', manager: 'Carlos Matos' },
    { number: 'VML-2025-0003', customerName: 'Fátima Cossa', customerPhone: '872341567', product: 'Nike Air Max + Adidas', zarAmount: 680, exchangeRate: 3.8, totalMzn: 12800, paidMzn: 0, debtMzn: 12800, tripId: 'VGM-001', status: 'UNPAID', date: '07/01', manager: 'Ana Silva' },
    { number: 'VML-2025-0004', customerName: 'José Tembe', customerPhone: '843219876', product: 'Laptop Lenovo IdeaPad', zarAmount: 2736, exchangeRate: 3.8, totalMzn: 52000, paidMzn: 52000, debtMzn: 0, tripId: 'VGM-002', status: 'PAID', date: '09/01', manager: 'Maria João' },
    { number: 'VML-2025-0005', customerName: 'Maria Machava', customerPhone: '821456789', product: 'Máquina de costura Singer', zarAmount: 963, exchangeRate: 3.8, totalMzn: 18300, paidMzn: 10000, debtMzn: 8300, tripId: 'VGM-002', status: 'PARTIAL', date: '11/01', manager: 'Carlos Matos' },
    { number: 'VML-2025-0006', customerName: 'Pedro Nhantumbo', customerPhone: '864523178', product: 'PlayStation 5 + 2 jogos', zarAmount: 2189, exchangeRate: 3.8, totalMzn: 41600, paidMzn: 41600, debtMzn: 0, tripId: 'VGM-002', status: 'PAID', date: '12/01', manager: 'Ana Silva' },
    { number: 'VML-2025-0007', customerName: 'Lurdes Sitoe', customerPhone: '853671234', product: 'Frigorífico Samsung', zarAmount: 1547, exchangeRate: 3.8, totalMzn: 29400, paidMzn: 0, debtMzn: 29400, tripId: 'VGM-002', status: 'UNPAID', date: '14/01', manager: 'Maria João' },
    { number: 'VML-2025-0008', customerName: 'António Bila', customerPhone: '874123456', product: 'Roupas variadas (5 peças)', zarAmount: 460, exchangeRate: 3.8, totalMzn: 8750, paidMzn: 8750, debtMzn: 0, tripId: 'VGM-003', status: 'PAID', date: '15/01', manager: 'Carlos Matos' },
    { number: 'VML-2025-0009', customerName: 'Rosa Mahumane', customerPhone: '861234987', product: 'Microondas + Air Fryer', zarAmount: 800, exchangeRate: 3.8, totalMzn: 15200, paidMzn: 8000, debtMzn: 7200, tripId: 'VGM-003', status: 'PARTIAL', date: '17/01', manager: 'Ana Silva' },
    { number: 'VML-2025-0010', customerName: 'Domingos Cuamba', customerPhone: '845678321', product: 'Bicicleta eléctrica', zarAmount: 1784, exchangeRate: 3.8, totalMzn: 33900, paidMzn: 0, debtMzn: 33900, tripId: 'VGM-003', status: 'UNPAID', date: '18/01', manager: 'Maria João' },
    { number: 'VML-2025-0011', customerName: 'Helena Nuvunga', customerPhone: '862345678', product: 'AirPods Pro + case', zarAmount: 950, exchangeRate: 3.8, totalMzn: 18050, paidMzn: 18050, debtMzn: 0, tripId: 'VGM-003', status: 'PAID', date: '19/01', manager: 'Carlos Matos' },
    { number: 'VML-2025-0012', customerName: 'Moisés Cuna', customerPhone: '871234560', product: 'Ferramentas Black+Decker', zarAmount: 720, exchangeRate: 3.8, totalMzn: 13680, paidMzn: 13680, debtMzn: 0, tripId: 'VGM-004', status: 'PAID', date: '20/01', manager: 'Ana Silva' },
    { number: 'VML-2025-0013', customerName: 'Beatriz Langa', customerPhone: '863456781', product: 'Sofá 3 lugares + 2 individuais', zarAmount: 3100, exchangeRate: 3.8, totalMzn: 58900, paidMzn: 30000, debtMzn: 28900, tripId: 'VGM-004', status: 'PARTIAL', date: '21/01', manager: 'Maria João' },
    { number: 'VML-2025-0014', customerName: 'Rui Mazive', customerPhone: '854321679', product: 'Máquina fotográfica Canon', zarAmount: 1842, exchangeRate: 3.8, totalMzn: 35000, paidMzn: 35000, debtMzn: 0, tripId: 'VGM-004', status: 'PAID', date: '22/01', manager: 'Carlos Matos' },
    { number: 'VML-2025-0015', customerName: 'Sandra Chissano', customerPhone: '843217890', product: 'Conjunto de panelas + utensílios', zarAmount: 410, exchangeRate: 3.8, totalMzn: 7790, paidMzn: 0, debtMzn: 7790, tripId: null, status: 'UNPAID', date: '23/01', manager: 'Ana Silva' }
  ];

  // Filters
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  managerFilter = 'ALL';
  dateFrom = '';
  dateTo = '';

  // Quick status counts
  get totalCount(): number {
    return this.orders.length;
  }

  get paidCount(): number {
    return this.orders.filter(o => o.status === 'PAID').length;
  }

  get partialCount(): number {
    return this.orders.filter(o => o.status === 'PARTIAL').length;
  }

  get unpaidCount(): number {
    return this.orders.filter(o => o.status === 'UNPAID').length;
  }

  // Selection
  selectedOrderNumbers: string[] = [];

  get hasSelection(): boolean {
    return this.selectedOrderNumbers.length > 0;
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedOrderNumbers = this.filteredOrders.map(o => o.number);
    } else {
      this.selectedOrderNumbers = [];
    }
  }

  isSelected(order: OrderRow): boolean {
    return this.selectedOrderNumbers.includes(order.number);
  }

  toggleSelection(order: OrderRow, checked: boolean): void {
    if (checked) {
      if (!this.selectedOrderNumbers.includes(order.number)) {
        this.selectedOrderNumbers = [...this.selectedOrderNumbers, order.number];
      }
    } else {
      this.selectedOrderNumbers = this.selectedOrderNumbers.filter(n => n !== order.number);
    }
  }

  // Modal state
  isPaymentModalOpen = false;
  isDetailModalOpen = false;
  selectedOrder: OrderRow | null = null;

  // Payment form
  paymentAmount = 0;
  paymentMethod = 'Dinheiro';
  paymentReference = '';
  paymentDate = '';
  markAsPaid = false;

  openPaymentModal(order: OrderRow): void {
    this.selectedOrder = order;
    this.paymentAmount = order.debtMzn > 0 ? order.debtMzn : order.totalMzn - order.paidMzn;
    this.paymentMethod = 'Dinheiro';
    this.paymentReference = '';
    this.paymentDate = new Date().toISOString().slice(0, 10);
    this.updateMarkAsPaid();
    this.isPaymentModalOpen = true;
  }

  openDetailModal(order: OrderRow): void {
    this.selectedOrder = order;
    this.isDetailModalOpen = true;
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen = false;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
  }

  updateMarkAsPaid(): void {
    if (!this.selectedOrder) return;
    const remaining = this.selectedOrder.totalMzn - this.selectedOrder.paidMzn;
    this.markAsPaid = this.paymentAmount >= remaining && remaining > 0;
  }

  confirmPayment(): void {
    // Mock only: we don't mutate data for now, just close modal
    this.isPaymentModalOpen = false;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.managerFilter = 'ALL';
    this.dateFrom = '';
    this.dateTo = '';
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.statusFilter !== 'ALL' ||
      this.managerFilter !== 'ALL' ||
      this.dateFrom !== '' ||
      this.dateTo !== ''
    );
  }

  setQuickStatus(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  private parseDate(dateStr: string): Date {
    // dateStr format 'DD/MM', assume 2025-01
    const [dayStr, monthStr] = dateStr.split('/');
    const day = Number(dayStr);
    const month = Number(monthStr);
    return new Date(2025, month - 1, day);
  }

  get filteredOrders(): OrderRow[] {
    return this.orders.filter(order => {
      const term = this.searchTerm.trim().toLowerCase();
      if (term) {
        const haystack =
          `${order.number} ${order.customerName} ${order.product}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      if (this.statusFilter !== 'ALL') {
        if (order.status !== this.statusFilter) {
          return false;
        }
      }

      if (this.managerFilter !== 'ALL' && order.manager !== this.managerFilter) {
        return false;
      }

      if (this.dateFrom) {
        const from = new Date(this.dateFrom);
        if (this.parseDate(order.date) < from) {
          return false;
        }
      }

      if (this.dateTo) {
        const to = new Date(this.dateTo);
        if (this.parseDate(order.date) > to) {
          return false;
        }
      }

      return true;
    });
  }

  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

