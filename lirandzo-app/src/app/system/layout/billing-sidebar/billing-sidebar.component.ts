import { Component, Input, Output, EventEmitter, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
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

  /** Item 2: formulário — criar, ajustar ou só pré-visualizar (PDF). */
  cotacaoFormSidebarLabel = 'Criar cotação';

  /** Item 3: lista — nome alinhado à página actual (enviadas / negociação). */
  cotacaoListaSidebarLabel = 'Cotações enviadas';

  ngOnInit(): void {
    this.tempoLogado = this.auth.getTempoLogado();
    this.actualizarRotulosCotacoesMenu();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      this.actualizarRotulosCotacoesMenu();
    });
    // Expandir menu activo conforme rota
    const url = this.router.url;
    if (url.includes('/encomendas') || url.includes('/baixas') || url.includes('/tesouraria') || url.includes('/para-facturar')) {
      this.expandedMenus['facturacao'] = true;
    } else if (url.includes('/cotacoes')) {
      this.expandedMenus['cotacoes'] = true;
    } else if (url.includes('/clientes')) {
      this.expandedMenus['clientes'] = true;
    }
    else if (url.includes('/guias')) this.expandedMenus['guias'] = true;
    else if (url.includes('/viagens')) this.expandedMenus['viagens'] = true;
    else if (url.includes('/viaturas')) this.expandedMenus['viaturas'] = true;
    else if (url.includes('/motoristas')) this.expandedMenus['motoristas'] = true;
    else if (url.includes('/combustivel')) this.expandedMenus['combustivel'] = true;
    else if (url.includes('/manutencao')) this.expandedMenus['manutencao'] = true;
    else if (url.includes('/ocorrencias')) this.expandedMenus['viaturas'] = true;
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

  private actualizarRotulosCotacoesMenu(): void {
    const full = this.router.url;
    const [path, queryString] = full.split('?');
    const qp = new URLSearchParams(queryString || '');
    const pdfOnly = qp.get('pdfOnly') === '1';

    if (path.includes('/cotacoes/enviadas')) {
      this.cotacaoListaSidebarLabel = 'Em negociação & ajuste';
    } else {
      this.cotacaoListaSidebarLabel = 'Cotações enviadas';
    }

    const gerarComId = /\/cotacoes\/gerar\/\d+\/?$/.test(path);
    if (gerarComId && pdfOnly) {
      this.cotacaoFormSidebarLabel = 'Pré-visualizar cotação';
    } else if (gerarComId) {
      this.cotacaoFormSidebarLabel = 'Ajustar cotação';
    } else {
      this.cotacaoFormSidebarLabel = 'Criar cotação';
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login-sistema']);
    this.onToggle();
  }
}
