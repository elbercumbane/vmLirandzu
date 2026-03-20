import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { AbastecimentoService, AbastecimentoRequest } from '../../../services/abastecimento.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-combustivel-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './combustivel-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', '../viaturas/viaturas-cadastro.component.css']
})
export class CombustivelCadastroComponent implements OnInit {
  viaturas: Viatura[] = [];
  form = {
    vehicleId: null as number | null,
    refuelDate: new Date().toISOString().split('T')[0],
    liters: null as number | null,
    cost: null as number | null,
    kmReading: null as number | null,
    station: '',
    notes: ''
  };

  loading = true;
  loadingForm = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private abastecimentoService: AbastecimentoService,
    private viaturaService: ViaturaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.viaturaService.listarViaturas().subscribe({
      next: (v) => {
        this.viaturas = v || [];
        this.loading = false;
      },
      error: () => {
        this.viaturas = [];
        this.loading = false;
      }
    });
  }

  salvar() {
    if (!this.form.vehicleId) {
      this.mostrarNotificacao('Seleccione a viatura.', 'error');
      return;
    }
    if (!this.form.liters || this.form.liters <= 0) {
      this.mostrarNotificacao('Litros são obrigatórios e devem ser positivos.', 'error');
      return;
    }
    if (!this.form.cost || this.form.cost < 0) {
      this.mostrarNotificacao('Custo é obrigatório.', 'error');
      return;
    }

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
    this.abastecimentoService.criar(req).subscribe({
      next: () => {
        this.mostrarNotificacao('Abastecimento registado com sucesso.', 'success');
        this.loadingForm = false;
        setTimeout(() => this.router.navigate(['/billing/combustivel']), 1200);
      },
      error: () => {
        this.mostrarNotificacao('Erro ao registar.', 'error');
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
