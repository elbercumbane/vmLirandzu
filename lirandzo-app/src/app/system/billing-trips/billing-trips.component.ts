import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingSidebarComponent } from '../layout/billing-sidebar/billing-sidebar.component';

type TripStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';

interface Trip {
  id: string;
  status: TripStatus;
  manager: string;
  startDate: string;
  endDate: string;
  route: string;
  totalOrders: number;
  paidOrders: number;
  partialOrders: number;
  unpaidOrders: number;
  totalValueMzn: number;
}

@Component({
  selector: 'app-billing-trips',
  standalone: true,
  imports: [CommonModule, BillingSidebarComponent],
  templateUrl: './billing-trips.component.html',
  styleUrl: './billing-trips.component.css'
})
export class BillingTripsComponent {
  sidebarOpen = false;

  trips: Trip[] = [
    {
      id: 'VGM-001',
      status: 'COMPLETED',
      manager: 'Ana Silva',
      startDate: '02/01/2025',
      endDate: '06/01/2025',
      route: 'Maputo → Joanesburgo → Maputo',
      totalOrders: 13,
      paidOrders: 8,
      partialOrders: 3,
      unpaidOrders: 2,
      totalValueMzn: 96500
    },
    {
      id: 'VGM-002',
      status: 'COMPLETED',
      manager: 'Carlos Matos',
      startDate: '09/01/2025',
      endDate: '13/01/2025',
      route: 'Maputo → Joanesburgo → Maputo',
      totalOrders: 14,
      paidOrders: 9,
      partialOrders: 3,
      unpaidOrders: 2,
      totalValueMzn: 119200
    },
    {
      id: 'VGM-003',
      status: 'IN_PROGRESS',
      manager: 'Maria João',
      startDate: '16/01/2025',
      endDate: '20/01/2025',
      route: 'Maputo → Joanesburgo → Maputo',
      totalOrders: 12,
      paidOrders: 7,
      partialOrders: 2,
      unpaidOrders: 3,
      totalValueMzn: 78900
    },
    {
      id: 'VGM-004',
      status: 'PLANNED',
      manager: 'Ana Silva',
      startDate: '23/01/2025',
      endDate: '27/01/2025',
      route: 'Maputo → Joanesburgo → Maputo',
      totalOrders: 8,
      paidOrders: 0,
      partialOrders: 0,
      unpaidOrders: 8,
      totalValueMzn: 113800
    }
  ];

  // KPI values
  get monthTrips(): number {
    return this.trips.length;
  }

  get inProgressTrips(): number {
    return this.trips.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get totalOrders(): number {
    return this.trips.reduce((sum, t) => sum + t.totalOrders, 0);
  }

  get totalValue(): number {
    return this.trips.reduce((sum, t) => sum + t.totalValueMzn, 0);
  }

  // Modal state
  guideModalOpen = false;
  fieldModalOpen = false;
  selectedTrip: Trip | null = null;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openGuideModal(trip: Trip): void {
    this.selectedTrip = trip;
    this.guideModalOpen = true;
  }

  closeGuideModal(): void {
    this.guideModalOpen = false;
  }

  openFieldModal(trip: Trip): void {
    this.selectedTrip = trip;
    this.fieldModalOpen = true;
  }

  closeFieldModal(): void {
    this.fieldModalOpen = false;
  }
}

