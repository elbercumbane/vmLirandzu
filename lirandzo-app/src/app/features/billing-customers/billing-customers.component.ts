import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingSidebarComponent } from '../../shared/billing-sidebar/billing-sidebar.component';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  debt: number;
  lastOrderDate: string;
  paymentRate: number; // 0-100
  isFrequent: boolean; // >= 3 orders
  isNew: boolean; // < 3 orders
}

type CustomerFilter = 'ALL' | 'WITH_DEBT' | 'NO_DEBT' | 'FREQUENT';
type SortOption = 'RECENT' | 'DEBT' | 'ORDERS' | 'ALPHABETICAL';

@Component({
  selector: 'app-billing-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSidebarComponent],
  templateUrl: './billing-customers.component.html',
  styleUrl: './billing-customers.component.css'
})
export class BillingCustomersComponent {
  sidebarOpen = false;

  customers: Customer[] = [
    { id: '1', name: 'Ana Rodrigues', phone: '054212348', email: 'ana@email.com', totalOrders: 4, totalSpent: 87400, debt: 0, lastOrderDate: '02/01', paymentRate: 100, isFrequent: true, isNew: false },
    { id: '2', name: 'Carlos Mondlane', phone: '084567123', email: null, totalOrders: 3, totalSpent: 74200, debt: 18500, lastOrderDate: '05/01', paymentRate: 75, isFrequent: true, isNew: false },
    { id: '3', name: 'Fátima Cossa', phone: '872341567', email: 'fatima@gmail.com', totalOrders: 2, totalSpent: 25600, debt: 12800, lastOrderDate: '07/01', paymentRate: 50, isFrequent: false, isNew: true },
    { id: '4', name: 'José Tembe', phone: '843219876', email: 'jose.tembe@email.com', totalOrders: 5, totalSpent: 142000, debt: 0, lastOrderDate: '09/01', paymentRate: 100, isFrequent: true, isNew: false },
    { id: '5', name: 'Maria Machava', phone: '821456789', email: null, totalOrders: 3, totalSpent: 52100, debt: 8300, lastOrderDate: '11/01', paymentRate: 84, isFrequent: true, isNew: false },
    { id: '6', name: 'Pedro Nhantumbo', phone: '864523178', email: 'pedro.n@gmail.com', totalOrders: 4, totalSpent: 98700, debt: 0, lastOrderDate: '12/01', paymentRate: 100, isFrequent: true, isNew: false },
    { id: '7', name: 'Lurdes Sitoe', phone: '853671234', email: null, totalOrders: 1, totalSpent: 29400, debt: 29400, lastOrderDate: '14/01', paymentRate: 0, isFrequent: false, isNew: true },
    { id: '8', name: 'António Bila', phone: '874123456', email: 'antonio@email.com', totalOrders: 6, totalSpent: 63200, debt: 0, lastOrderDate: '15/01', paymentRate: 100, isFrequent: true, isNew: false },
    { id: '9', name: 'Rosa Mahumane', phone: '861234987', email: null, totalOrders: 2, totalSpent: 28900, debt: 7200, lastOrderDate: '17/01', paymentRate: 72, isFrequent: false, isNew: true },
    { id: '10', name: 'Domingos Cuamba', phone: '845678321', email: 'domingos@gmail.com', totalOrders: 2, totalSpent: 67800, debt: 33900, lastOrderDate: '18/01', paymentRate: 50, isFrequent: false, isNew: true },
    { id: '11', name: 'Helena Nuvunga', phone: '862345678', email: 'helena@email.com', totalOrders: 3, totalSpent: 54150, debt: 0, lastOrderDate: '19/01', paymentRate: 100, isFrequent: true, isNew: false },
    { id: '12', name: 'Beatriz Langa', phone: '863456781', email: null, totalOrders: 1, totalSpent: 58900, debt: 28900, lastOrderDate: '21/01', paymentRate: 49, isFrequent: false, isNew: true }
  ];

  searchTerm = '';
  filter: CustomerFilter = 'ALL';
  sortOption: SortOption = 'RECENT';

  // KPI values
  get totalCustomers(): number {
    return this.customers.length;
  }

  get customersWithDebt(): number {
    return this.customers.filter(c => c.debt > 0).length;
  }

  get customerOfMonth(): string {
    return 'José Tembe';
  }

  get totalDebt(): number {
    return this.customers.reduce((sum, c) => sum + c.debt, 0);
  }

  // Filtered and sorted customers
  get filteredCustomers(): Customer[] {
    let result = [...this.customers];

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    }

    // Apply filter
    if (this.filter === 'WITH_DEBT') {
      result = result.filter(c => c.debt > 0);
    } else if (this.filter === 'NO_DEBT') {
      result = result.filter(c => c.debt === 0);
    } else if (this.filter === 'FREQUENT') {
      result = result.filter(c => c.isFrequent);
    }

    // Apply sort
    if (this.sortOption === 'DEBT') {
      result.sort((a, b) => b.debt - a.debt);
    } else if (this.sortOption === 'ORDERS') {
      result.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (this.sortOption === 'ALPHABETICAL') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    // RECENT is default (already sorted by lastOrderDate in mock data)

    return result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filter = 'ALL';
    this.sortOption = 'RECENT';
  }

  getCustomerColor(name: string): string {
    // Very subtle neutral tones - almost monochrome
    const colors = [
      'rgba(55, 65, 81, 0.08)', // gray very subtle
      'rgba(75, 85, 99, 0.08)', // gray slightly darker
      'rgba(55, 65, 81, 0.1)', // gray subtle
      'rgba(75, 85, 99, 0.1)', // gray darker
      'rgba(55, 65, 81, 0.09)', // gray very subtle
      'rgba(75, 85, 99, 0.09)' // gray slightly darker
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getCustomerBorderColor(name: string): string {
    // Very subtle neutral borders - almost invisible
    return 'rgba(55, 65, 81, 0.3)'; // Same subtle gray for all
  }

  getCustomerInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getPaymentRateColor(rate: number): string {
    if (rate >= 80) return '#22C55E';
    if (rate >= 50) return '#EAB308';
    return '#EF4444';
  }

  // Modal states
  historyModalOpen = false;
  chargeModalOpen = false;
  selectedCustomer: Customer | null = null;
  activeTab: 'ORDERS' | 'PAYMENTS' | 'NOTES' = 'ORDERS';

  openHistoryModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.historyModalOpen = true;
    this.activeTab = 'ORDERS';
  }

  closeHistoryModal(): void {
    this.historyModalOpen = false;
    this.selectedCustomer = null;
  }

  openChargeModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.chargeModalOpen = true;
  }

  closeChargeModal(): void {
    this.chargeModalOpen = false;
    this.selectedCustomer = null;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
