import { Component, Input, Output, EventEmitter, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-billing-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './billing-sidebar.component.html',
  styleUrl: './billing-sidebar.component.css'
})
export class BillingSidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private auth = inject(AuthService);
  private router = inject(Router);
  userProfile = this.auth.currentUser;
  roleLabel = computed(() => this.auth.roleLabel);
  get canAccessConfiguracoes(): boolean { return this.auth.canAccessConfiguracoes(); }
  tempoLogado = '';

  expandedMenus: Record<string, boolean> = {};
  private tempoInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.tempoLogado = this.auth.getTempoLogado();
    this.tempoInterval = setInterval(() => {
      this.tempoLogado = this.auth.getTempoLogado();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.tempoInterval) clearInterval(this.tempoInterval);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  toggleMenu(menu: string): void {
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }

  isExpanded(menu: string): boolean {
    return !!this.expandedMenus[menu];
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.onToggle();
  }
}
