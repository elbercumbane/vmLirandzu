import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-billing-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './billing-sidebar.component.html',
  styleUrl: './billing-sidebar.component.css'
})
export class BillingSidebarComponent {
  @Input() isOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', route: '/billing', icon: '📊' },
    { label: 'Encomendas', route: '/billing/encomendas', icon: '📦' },
    { label: 'Viagens', route: '/billing/viagens', icon: '🚛' },
    { label: 'Pagamentos', route: '/billing/pagamentos', icon: '💳' },
    { label: 'Relatórios', route: '/billing/relatorios', icon: '📄' },
    { label: 'Clientes', route: '/billing/clientes', icon: '👥' },
    { label: 'Configurações', route: '/billing/configuracoes', icon: '⚙️' }
  ];

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
