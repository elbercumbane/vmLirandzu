import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViagemService, ViagemResponse } from '../../../services/viagem.service';

@Component({
  selector: 'app-viagens-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './viagens-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-detalhe.component.css']
})
export class ViagensDetalheComponent implements OnInit {
  viagem: ViagemResponse | null = null;
  loading = true;
  error: string | null = null;
  viagemId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viagemService: ViagemService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viagemId = +id;
      this.carregarViagem();
    } else {
      this.error = 'ID da viagem não fornecido';
      this.loading = false;
    }
  }

  carregarViagem() {
    if (!this.viagemId) return;

    this.loading = true;
    this.error = null;

    this.viagemService.obterViagem(this.viagemId).subscribe({
      next: (viagem) => {
        this.viagem = viagem;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar viagem:', error);
        this.error = 'Erro ao carregar viagem da base de dados';
        this.loading = false;
      }
    });
  }

  formatarData(data?: string): string {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatarStatus(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'PLANEADA': 'AGENDADA',
      'EM_CURSO': 'EM CURSO',
      'CONCLUIDA': 'CONCLUÍDA',
      'CANCELADA': 'CANCELADA'
    };
    return statusMap[status?.toUpperCase() || ''] || status || 'N/A';
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'CONCLUIDA') return 'badge-success';
    if (statusUpper === 'EM_CURSO') return 'badge-info';
    if (statusUpper === 'PLANEADA') return 'badge-warning';
    return 'badge-danger';
  }

  editar() {
    if (this.viagemId) {
      this.router.navigate(['/billing/viagens', this.viagemId, 'editar']);
    }
  }
}
