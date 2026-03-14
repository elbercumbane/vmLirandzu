import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardNavbarComponent } from '../../../shared/dashboard-navbar/dashboard-navbar.component';
import { BillingSidebarComponent } from '../../../shared/billing-sidebar/billing-sidebar.component';

@Component({
  selector: 'app-billing-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardNavbarComponent, BillingSidebarComponent],
  templateUrl: './billing-layout.component.html',
  styleUrl: './billing-layout.component.css'
})
export class BillingLayoutComponent {
  /** Em desktop o sidebar fica sempre visível via CSS; em mobile controla overlay */
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
