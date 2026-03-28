import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { RastreamentoService, RastreamentoTimeline } from '../../../services/rastreamento.service';

@Component({
  selector: 'app-encomendas-historico',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './encomendas-historico.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-historico.component.css']
})
export class EncomendasHistoricoComponent implements OnInit {
  encomendaId: number | null = null;
  timeline: RastreamentoTimeline | null = null;
  loading = true;
  error: string | null = null;
  backLink = '/billing/encomendas';

  constructor(
    private route: ActivatedRoute,
    private rastreamentoService: RastreamentoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID da encomenda em falta';
      this.loading = false;
      return;
    }
    this.encomendaId = +id;
    this.backLink = `/billing/encomendas/${this.encomendaId}`;
    this.carregar();
  }

  private carregar(): void {
    if (!this.encomendaId) return;
    this.loading = true;
    this.error = null;
    this.rastreamentoService
      .obterTimelinePorEncomenda(this.encomendaId)
      .pipe(
        catchError(() => {
          this.error = 'Não foi possível carregar o histórico de etapas.';
          return of(null as RastreamentoTimeline | null);
        })
      )
      .subscribe((t) => {
        this.timeline = t;
        this.loading = false;
      });
  }

  formatarDataHora(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
