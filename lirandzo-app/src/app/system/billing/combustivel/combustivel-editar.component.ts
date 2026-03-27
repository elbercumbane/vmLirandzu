import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { AbastecimentoService, Abastecimento, AbastecimentoRequest } from '../../../services/abastecimento.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-combustivel-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './combustivel-editar.component.html',
  styleUrls: ['../shared/billing-page.css', '../viaturas/viaturas-cadastro.component.css']
})
export class CombustivelEditarComponent implements OnInit {
  abastecimento: Abastecimento | null = null;
  viaturas: Viatura[] = [];
  form = {
    vehicleId: null as number | null,
    refuelDate: '',
    liters: null as number | null,
    cost: null as number | null,
    kmReading: null as number | null,
    station: '',
    notes: ''
  };

  loading = true;
  loadingForm = false;
  abastecimentoId: number | null = null;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private abastecimentoService: AbastecimentoService,
    private viaturaService: ViaturaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.abastecimentoId = +id;
      this.carregarDados();
    }
  }

  carregarDados() {
    if (!this.abastecimentoId) return;
    this.loading = true;
    Promise.all([
      this.abastecimentoService.obter(this.abastecimentoId).toPromise(),
      this.viaturaService.listarViaturas().toPromise()
    ]).then(([a, v]) => {
      this.abastecimento = a || null;
      this.viaturas = v || [];
      if (this.abastecimento) {
        this.form.vehicleId = this.abastecimento.vehicleId;
        this.form.refuelDate = this.abastecimento.refuelDate
          ? new Date(this.abastecimento.refuelDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        this.form.liters = this.abastecimento.liters;
        this.form.cost = this.abastecimento.cost;
        this.form.kmReading = this.abastecimento.kmReading ?? null;
        this.form.station = this.abastecimento.station || '';
        this.form.notes = this.abastecimento.notes || '';
      }
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }

  guardar() {
    if (!this.form.vehicleId || !this.form.liters || this.form.liters <= 0 || this.form.cost == null || this.form.cost < 0 || !this.abastecimentoId) return;

    const req: AbastecimentoRequest = {
      vehicleId: this.form.vehicleId,
      refuelDate: this.form.refuelDate,
      liters: this.form.liters,
      cost: this.form.cost,
      kmReading: this.form.kmReading ?? undefined,
      station: this.form.station || undefined,
      notes: this.form.notes || undefined
    };

    this.loadingForm = true;
    this.abastecimentoService.actualizar(this.abastecimentoId, req).subscribe({
      next: () => {
        this.mostrarNotificacao('Abastecimento actualizado.', 'success');
        this.loadingForm = false;
        setTimeout(() => this.router.navigate(['/billing/combustivel']), 1200);
      },
      error: () => {
        this.mostrarNotificacao('Erro ao actualizar.', 'error');
        this.loadingForm = false;
      }
    });
  }

  mostrarNotificacao(msg: string, tipo: 'success' | 'error') {
    this.notificationMessage = msg;
    this.notificationType = tipo;
    this.showNotification = true;
  }
}
