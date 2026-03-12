import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';

@Component({
  selector: 'app-encomendas-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './encomendas-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-detalhe.component.css']
})
export class EncomendasDetalheComponent implements OnInit {
  encomenda: EncomendaResponse | null = null;
  loading = true;
  error: string | null = null;
  encomendaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encomendaService: EncomendaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.encomendaId = +id;
      this.carregarEncomenda();
    } else {
      this.error = 'ID da encomenda não fornecido';
      this.loading = false;
    }
  }

  carregarEncomenda() {
    if (!this.encomendaId) return;

    this.loading = true;
    this.error = null;

    this.encomendaService.obterEncomenda(this.encomendaId).subscribe({
      next: (encomenda) => {
        this.encomenda = encomenda;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar encomenda:', error);
        this.error = 'Erro ao carregar encomenda da base de dados';
        this.loading = false;
      }
    });
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatarNumero(numero: number): string {
    return `VML-${String(numero).padStart(4, '0')}`;
  }

  formatarStatus(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAGO') return 'PAGO';
    if (statusUpper === 'PARCIAL') return 'PARCIAL';
    if (statusUpper === 'NAO_PAGO' || statusUpper === 'NÃO_PAGO') return 'NÃO PAGO';
    return status;
  }

  getStatusClass(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAGO') return 'badge-success';
    if (statusUpper === 'PARCIAL') return 'badge-warning';
    return 'badge-danger';
  }

  editar() {
    if (this.encomendaId) {
      this.router.navigate(['/billing/encomendas', this.encomendaId, 'editar']);
    }
  }
}
