import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { OcorrenciaService, Ocorrencia, OcorrenciaRequest } from '../../../services/ocorrencia.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-ocorrencias-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './ocorrencias-editar.component.html',
  styleUrls: ['../shared/billing-page.css', '../viaturas/viaturas-cadastro.component.css']
})
export class OcorrenciasEditarComponent implements OnInit {
  ocorrencia: Ocorrencia | null = null;
  viaturas: Viatura[] = [];
  motoristas: Motorista[] = [];

  form = {
    vehicleId: null as number | null,
    driverId: null as number | null,
    data: '',
    tipo: '' as '' | 'AVARIA' | 'ACIDENTE' | 'MANUTENCAO',
    impactoVeiculo: '' as '' | 'OPERACIONAL' | 'EM_REPARACAO' | 'PERDA_TOTAL',
    descricao: '',
    gravidade: '' as '' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA',
    status: '' as '' | 'ABERTO' | 'EM_REPARACAO' | 'RESOLVIDO',
    custoEstimado: null as number | null
  };

  loading = true;
  loadingForm = false;
  error: string | null = null;
  ocorrenciaId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ocorrenciaService: OcorrenciaService,
    private viaturaService: ViaturaService,
    private motoristaService: MotoristaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ocorrenciaId = +id;
      this.carregarDados();
    } else {
      this.loading = false;
      this.mostrarNotificacao('ID da ocorrência não fornecido', 'error');
    }
  }

  carregarDados() {
    if (!this.ocorrenciaId) return;

    this.loading = true;
    this.error = null;

    Promise.all([
      this.ocorrenciaService.obter(this.ocorrenciaId).toPromise(),
      this.viaturaService.listarViaturas().toPromise(),
      this.motoristaService.listarMotoristas().toPromise()
    ]).then(([o, v, m]) => {
      this.ocorrencia = o || null;
      this.viaturas = v || [];
      this.motoristas = m || [];

      if (this.ocorrencia) {
        this.form.vehicleId = this.ocorrencia.vehicleId;
        this.form.driverId = this.ocorrencia.driverId ?? null;
        this.form.data = this.ocorrencia.occurrenceDate
          ? new Date(this.ocorrencia.occurrenceDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        this.form.tipo = this.ocorrencia.type as 'AVARIA' | 'ACIDENTE' | 'MANUTENCAO';
        this.form.impactoVeiculo = (this.ocorrencia.vehicleImpact || 'OPERACIONAL') as 'OPERACIONAL' | 'EM_REPARACAO' | 'PERDA_TOTAL';
        this.form.descricao = this.ocorrencia.description || '';
        this.form.gravidade = (this.ocorrencia.severity || '') as '' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
        this.form.status = (this.ocorrencia.status || 'ABERTO') as 'ABERTO' | 'EM_REPARACAO' | 'RESOLVIDO';
        this.form.custoEstimado = this.ocorrencia.estimatedCost ?? null;
      }

      this.loading = false;
    }).catch(err => {
      console.error('Erro ao carregar:', err);
      this.error = 'Erro ao carregar dados.';
      this.loading = false;
    });
  }

  guardar() {
    if (!this.form.vehicleId) {
      this.mostrarNotificacao('Seleccione a viatura.', 'error');
      return;
    }
    if (!this.form.tipo) {
      this.mostrarNotificacao('Seleccione o tipo.', 'error');
      return;
    }
    if (this.form.tipo === 'ACIDENTE' && !this.form.driverId) {
      this.mostrarNotificacao('Motorista é obrigatório para acidentes.', 'error');
      return;
    }
    if (!this.form.impactoVeiculo) {
      this.mostrarNotificacao('Indique o estado da viatura após a ocorrência.', 'error');
      return;
    }
    if (!this.form.descricao?.trim()) {
      this.mostrarNotificacao('Preencha a descrição.', 'error');
      return;
    }
    if (!this.form.status) {
      this.mostrarNotificacao('Seleccione o estado da ocorrência.', 'error');
      return;
    }
    if (!this.ocorrenciaId) return;

    const req: OcorrenciaRequest = {
      vehicleId: this.form.vehicleId,
      driverId: this.form.driverId || undefined,
      occurrenceDate: this.form.data,
      type: this.form.tipo,
      description: this.form.descricao.trim(),
      vehicleImpact: this.form.impactoVeiculo,
      severity: this.form.gravidade || undefined,
      status: this.form.status,
      estimatedCost: this.form.custoEstimado || undefined
    };

    this.loadingForm = true;
    this.ocorrenciaService.actualizar(this.ocorrenciaId, req).subscribe({
      next: () => {
        this.mostrarNotificacao('Ocorrência actualizada com sucesso.', 'success');
        this.loadingForm = false;
        setTimeout(() => this.router.navigate(['/billing/ocorrencias']), 1200);
      },
      error: err => {
        console.error('Erro ao actualizar:', err);
        this.mostrarNotificacao('Erro ao actualizar. Tente novamente.', 'error');
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
