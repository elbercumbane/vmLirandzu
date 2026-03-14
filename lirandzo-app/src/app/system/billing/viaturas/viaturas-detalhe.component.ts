import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViaturaService, Viatura } from '../../../services/viatura.service';

@Component({
  selector: 'app-viaturas-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './viaturas-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-detalhe.component.css']
})
export class ViaturasDetalheComponent implements OnInit {
  viatura: Viatura | null = null;
  loading = true;
  error: string | null = null;
  viaturaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viaturaService: ViaturaService
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
      },
      error: (error) => {
        console.error('Erro ao carregar viatura:', error);
        this.error = 'Erro ao carregar viatura da base de dados';
        this.loading = false;
      }
    });
  }

  formatarStatus(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'ATIVA': 'OPERACIONAL',
      'EM_MANUTENCAO': 'MANUTENÇÃO',
      'RESERVADA': 'RESERVADA',
      'INATIVA': 'PARADO'
    };
    return statusMap[status?.toUpperCase() || ''] || status || 'N/A';
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ATIVA') return 'badge-success';
    if (statusUpper === 'EM_MANUTENCAO') return 'badge-warning';
    if (statusUpper === 'INATIVA') return 'badge-danger';
    return 'badge-neutral';
  }

  editar() {
    if (this.viaturaId) {
      this.router.navigate(['/billing/viaturas', this.viaturaId, 'editar']);
    }
  }
}
