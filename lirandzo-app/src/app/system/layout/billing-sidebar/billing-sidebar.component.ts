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

  /** Item 3: lista comercial (rota técnica ainda `cotacoes/enviadas`). */
  cotacaoListaSidebarLabel = 'Negociação e ajuste';

  ngOnInit(): void {
    this.tempoLogado = this.auth.getTempoLogado();
    this.actualizarRotulosCotacoesMenu();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      this.actualizarRotulosCotacoesMenu();
      this.expandirMenusParaUrl();
    });
    this.expandirMenusParaUrl();
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

  private pathSemQuery(url: string): string {
    let p = url.split('?')[0];
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  /** Lista, detalhe, editar ou histórico — não inclui «nova» nem «pagamentos». */
  isFacturasListaContextoAtivo(): boolean {
    const p = this.pathSemQuery(this.router.url);
    if (p.startsWith('/billing/encomendas/pagamentos')) return false;
    if (p === '/billing/encomendas') return true;
    if (p.startsWith('/billing/encomendas/nova')) return false;
    return p.startsWith('/billing/encomendas/');
  }

  isPagamentosRegistoAtivo(): boolean {
    return this.pathSemQuery(this.router.url).startsWith('/billing/encomendas/pagamentos');
  }

  isNovaFacturaManualAtiva(): boolean {
    return this.pathSemQuery(this.router.url).startsWith('/billing/encomendas/nova');
  }

  /** Secção Facturas (submenu) com algum destino actual. */
  isGrupoFacturasDestacado(): boolean {
    const p = this.pathSemQuery(this.router.url);
    return p.includes('/para-facturar') || p.startsWith('/billing/encomendas');
  }

  private expandirMenusParaUrl(): void {
    const url = this.router.url;
    if (url.includes('/cotacoes')) {
      this.expandedMenus['cotacoes'] = true;
    }
    if (url.includes('/encomendas') || url.includes('/para-facturar')) {
      this.expandedMenus['facturas'] = true;
    }
    if (url.includes('/baixas') || url.includes('/tesouraria')) {
      this.expandedMenus['recibos'] = true;
    }
    if (url.includes('/clientes')) {
      this.expandedMenus['clientes'] = true;
    }
    if (url.includes('/guias')) {
      this.expandedMenus['guias'] = true;
    }
    if (url.includes('/viagens')) {
      this.expandedMenus['frota'] = true;
      this.expandedMenus['viagens'] = true;
    }
    if (url.includes('/motoristas')) {
      this.expandedMenus['frota'] = true;
      this.expandedMenus['motoristas'] = true;
    }
    if (url.includes('/viaturas') || url.includes('/ocorrencias')) {
      this.expandedMenus['frota'] = true;
      this.expandedMenus['viaturas'] = true;
    }
    if (url.includes('/combustivel')) {
      this.expandedMenus['frota'] = true;
      this.expandedMenus['combustivel'] = true;
    }
    if (url.includes('/manutencao')) {
      this.expandedMenus['frota'] = true;
      this.expandedMenus['manutencao'] = true;
    }
  }

  private actualizarRotulosCotacoesMenu(): void {
    const full = this.router.url;
    const [path, queryString] = full.split('?');
    const qp = new URLSearchParams(queryString || '');
    const pdfOnly = qp.get('pdfOnly') === '1';

    this.cotacaoListaSidebarLabel = 'Negociação e ajuste';

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
