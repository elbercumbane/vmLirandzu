import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { OcorrenciaService, Ocorrencia } from '../../../services/ocorrencia.service';

@Component({
  selector: 'app-viaturas-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './viaturas-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-detalhe.component.css']
})
export class ViaturasDetalheComponent implements OnInit {
  viatura: Viatura | null = null;
  ocorrencias: Ocorrencia[] = [];
  loading = true;
  loadingOcorrencias = true;
  error: string | null = null;
  viaturaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viaturaService: ViaturaService,
    private ocorrenciaService: OcorrenciaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viaturaId = +id;
      this.carregarViatura();
    } else {
      this.error = 'ID da viatura não fornecido';
      this.loading = false;
    }
  }

  carregarViatura() {
    if (!this.viaturaId) return;

    this.loading = true;
    this.error = null;

    this.viaturaService.obterViatura(this.viaturaId).subscribe({
      next: (viatura) => {
        this.viatura = viatura;
        this.loading = false;
        this.carregarOcorrencias();
      },
      error: (error) => {
        console.error('Erro ao carregar viatura:', error);
        this.error = 'Erro ao carregar viatura da base de dados';
        this.loading = false;
      }
    });
  }

  carregarOcorrencias() {
    if (!this.viaturaId) return;
    this.loadingOcorrencias = true;
    this.ocorrenciaService.porViatura(this.viaturaId).subscribe({
      next: (lista) => {
        this.ocorrencias = lista || [];
        this.loadingOcorrencias = false;
      },
      error: () => {
        this.ocorrencias = [];
        this.loadingOcorrencias = false;
      }
    });
  }

  registarOcorrencia() {
    this.router.navigate(['/billing/ocorrencias'], { queryParams: { viatura: this.viaturaId } });
  }

  formatarData(data: string): string {
    return data ? new Date(data).toLocaleDateString('pt-MZ') : '—';
  }

  formatarTipo(tipo: string): string {
    const map: Record<string, string> = { ACIDENTE: 'Acidente', AVARIA: 'Avaria', MANUTENCAO: 'Manutenção' };
    return map[tipo] || tipo;
  }

  formatarEstado(e?: string): string {
    if (!e) return '—';
    const map: Record<string, string> = { ABERTO: 'Aberto', EM_REPARACAO: 'Em Reparação', RESOLVIDO: 'Resolvido' };
    return map[e.toUpperCase().replace(/\s+/g, '_')] || e;
  }

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'ACIDENTE': return 'badge badge-danger';
      case 'AVARIA': return 'badge badge-warning';
      case 'MANUTENCAO': return 'badge badge-info';
      default: return 'badge badge-neutral';
    }
  }

  getEstadoBadge(e?: string): string {
    const key = (e || '').toUpperCase().replace(/\s+/g, '_');
    switch (key) {
      case 'ABERTO': return 'badge badge-danger';
      case 'EM_REPARACAO': return 'badge badge-warning';
      case 'RESOLVIDO': return 'badge badge-success';
      default: return 'badge badge-neutral';
    }
  }

  formatarStatus(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'OPERACIONAL',
      'UNDER_MAINTENANCE': 'EM MANUTENÇÃO',
      'RESERVED': 'RESERVADA',
      'INACTIVE': 'INACTIVA',
      'ATIVA': 'OPERACIONAL',
      'EM_MANUTENCAO': 'EM MANUTENÇÃO',
      'RESERVADA': 'RESERVADA',
      'INATIVA': 'INACTIVA'
    };
    return statusMap[status?.toUpperCase() || ''] || status || 'N/A';
  }

  formatarCapacidade(v: Viatura): string {
    const cap = v.capacidade;
    if (cap == null || cap === 0) return 'N/A';
    const u = (v.capacidadeUnidade || 'KG').toLowerCase();
    return `${Number(cap).toFixed(2)} ${u === 'ton' ? 'ton' : 'kg'}`;
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ACTIVE' || statusUpper === 'ATIVA') return 'badge-success';
    if (statusUpper === 'UNDER_MAINTENANCE' || statusUpper === 'EM_MANUTENCAO') return 'badge-warning';
    if (statusUpper === 'RESERVED' || statusUpper === 'RESERVADA') return 'badge-info';
    if (statusUpper === 'INACTIVE' || statusUpper === 'INATIVA') return 'badge-danger';
    return 'badge-neutral';
  }

  editar() {
    if (this.viaturaId) {
      this.router.navigate(['/billing/viaturas', this.viaturaId, 'editar']);
    }
  }
}
