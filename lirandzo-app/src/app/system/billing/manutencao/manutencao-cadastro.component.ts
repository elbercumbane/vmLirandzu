import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ManutencaoService, ManutencaoRequest } from '../../../services/manutencao.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-manutencao-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './manutencao-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', '../viaturas/viaturas-cadastro.component.css']
})
export class ManutencaoCadastroComponent implements OnInit {
  viaturas: Viatura[] = [];
  form = {
    vehicleId: null as number | null,
    maintenanceDate: new Date().toISOString().split('T')[0],
    type: 'CORRETIVA',
    description: '',
    cost: null as number | null,
    partsReplaced: '',
    workshop: '',
    kmReading: null as number | null,
    status: 'CONCLUIDA'
  };

  tipos = [
    { value: 'PREVENTIVA', label: 'Preventiva' },
    { value: 'CORRETIVA', label: 'Correctiva' },
    { value: 'INSPECAO', label: 'Inspecção' },
    { value: 'REVISAO', label: 'Revisão' }
  ];

  loading = true;
  loadingForm = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private manutencaoService: ManutencaoService,
    private viaturaService: ViaturaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.viaturaService.listarViaturas().subscribe({
      next: (v) => { this.viaturas = v || []; this.loading = false; },
      error: () => { this.viaturas = []; this.loading = false; }
    });
  }

  salvar() {
    if (!this.form.vehicleId) {
      this.mostrarNotificacao('Seleccione a viatura.', 'error');
      return;
    }
    if (!this.form.description?.trim()) {
      this.mostrarNotificacao('Descrição é obrigatória.', 'error');
      return;
    }

    const req: ManutencaoRequest = {
      vehicleId: this.form.vehicleId,
      maintenanceDate: this.form.maintenanceDate,
      type: this.form.type,
      description: this.form.description.trim(),
      cost: this.form.cost ?? undefined,
      partsReplaced: this.form.partsReplaced || undefined,
      workshop: this.form.workshop || undefined,
      kmReading: this.form.kmReading ?? undefined,
      status: this.form.status
    };

    this.loadingForm = true;
    this.manutencaoService.criar(req).subscribe({
      next: () => {
        this.mostrarNotificacao('Manutenção registada com sucesso.', 'success');
        this.loadingForm = false;
        setTimeout(() => this.router.navigate(['/billing/manutencao']), 1200);
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
