import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ManutencaoService, Manutencao, ManutencaoRequest } from '../../../services/manutencao.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-manutencao-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './manutencao-editar.component.html',
  styleUrls: ['../shared/billing-page.css', '../viaturas/viaturas-cadastro.component.css']
})
export class ManutencaoEditarComponent implements OnInit {
  manutencao: Manutencao | null = null;
  viaturas: Viatura[] = [];
  form = {
    vehicleId: null as number | null,
    maintenanceDate: '',
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
  manutencaoId: number | null = null;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manutencaoService: ManutencaoService,
    private viaturaService: ViaturaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.manutencaoId = +id;
      this.carregarDados();
    }
  }

  carregarDados() {
    if (!this.manutencaoId) return;
    this.loading = true;
    Promise.all([
      this.manutencaoService.obter(this.manutencaoId).toPromise(),
      this.viaturaService.listarViaturas().toPromise()
    ]).then(([m, v]) => {
      this.manutencao = m || null;
      this.viaturas = v || [];
      if (this.manutencao) {
        this.form.vehicleId = this.manutencao.vehicleId;
        this.form.maintenanceDate = this.manutencao.maintenanceDate
          ? new Date(this.manutencao.maintenanceDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        this.form.type = this.manutencao.type || 'CORRETIVA';
        this.form.description = this.manutencao.description || '';
        this.form.cost = this.manutencao.cost ?? null;
        this.form.partsReplaced = this.manutencao.partsReplaced || '';
        this.form.workshop = this.manutencao.workshop || '';
        this.form.kmReading = this.manutencao.kmReading ?? null;
        this.form.status = this.manutencao.status || 'CONCLUIDA';
      }
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }

  guardar() {
    if (!this.form.vehicleId || !this.form.description?.trim() || !this.manutencaoId) return;

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
    this.manutencaoService.actualizar(this.manutencaoId, req).subscribe({
      next: () => {
        this.mostrarNotificacao('Manutenção actualizada.', 'success');
        this.loadingForm = false;
        setTimeout(() => this.router.navigate(['/billing/manutencao']), 1200);
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
