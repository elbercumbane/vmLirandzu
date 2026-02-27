import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BillingSidebarComponent } from '../../../shared/billing-sidebar/billing-sidebar.component';
import { DashboardNavbarComponent } from '../../../shared/dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-billing-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BillingSidebarComponent, DashboardNavbarComponent],
  templateUrl: './billing-layout.component.html',
  styleUrl: './billing-layout.component.css'
})
export class BillingLayoutComponent {
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
