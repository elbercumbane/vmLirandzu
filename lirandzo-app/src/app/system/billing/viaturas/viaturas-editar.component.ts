import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-viaturas-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './viaturas-editar.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-cadastro.component.css']
})
export class ViaturasEditarComponent implements OnInit {
  viatura = {
    matricula: '',
    marca: '',
    modelo: '',
    tipo: '',
    capacidade: null as number | null,
    status: 'ATIVA'
  };

  tiposViatura = ['Camião Pesado', 'Camião Médio', 'Camião Leve', 'Reboque', 'Semi-Reboque'];

  loading = true;
  error: string | null = null;
  viaturaId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

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
      this.loading = false;
      this.mostrarNotificacao('ID da viatura não fornecido', 'error');
    }
  }

  carregarViatura() {
    if (!this.viaturaId) {
      this.error = 'ID da viatura não fornecido';
      this.loading = false;
      this.mostrarNotificacao('ID da viatura não fornecido', 'error');
      return;
    }

    this.loading = true;
    this.error = null;
    this.viaturaService.obterViatura(this.viaturaId).subscribe({
      next: (viaturaApi: Viatura) => {
        try {
          this.viatura.matricula = viaturaApi.matricula || '';
          this.viatura.marca = viaturaApi.marca || '';
          this.viatura.modelo = viaturaApi.modelo || '';
          this.viatura.tipo = viaturaApi.tipo || '';
          this.viatura.capacidade = viaturaApi.capacidade || null;
          this.viatura.status = viaturaApi.status || 'ATIVA';
          this.loading = false;
        } catch (error) {
          console.error('Erro ao processar dados da viatura:', error);
          this.loading = false;
          this.error = 'Erro ao processar dados da viatura';
          this.mostrarNotificacao('Erro ao processar dados da viatura', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar viatura:', error);
        this.loading = false;
        const mensagemErro = error.status === 404 
          ? 'Viatura não encontrada' 
          : error.status === 0
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
          : `Erro ao carregar viatura: ${error.statusText || error.message}`;
        this.error = mensagemErro;
        this.mostrarNotificacao(mensagemErro, 'error');
      }
    });
  }

  mostrarNotificacao(mensagem: string, tipo: 'success' | 'error') {
    this.notificationMessage = mensagem;
    this.notificationType = tipo;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 7000);
  }

  getBackLink(): string {
    return this.viaturaId ? `/billing/viaturas/${this.viaturaId}` : '/billing/viaturas';
  }

  salvar() {
    if (!this.viatura.matricula || !this.viatura.matricula.trim()) {
      this.mostrarNotificacao('Por favor, preencha a matrícula da viatura.', 'error');
      return;
    }
    if (!this.viatura.marca || !this.viatura.marca.trim()) {
      this.mostrarNotificacao('Por favor, preencha a marca da viatura.', 'error');
      return;
    }
    if (!this.viatura.modelo || !this.viatura.modelo.trim()) {
      this.mostrarNotificacao('Por favor, preencha o modelo da viatura.', 'error');
      return;
    }

    if (!this.viaturaId) {
      this.mostrarNotificacao('Viatura não guardada', 'error');
      return;
    }

    const viaturaData: Viatura = {
      matricula: this.viatura.matricula.trim(),
      marca: this.viatura.marca.trim(),
      modelo: this.viatura.modelo.trim(),
      tipo: this.viatura.tipo?.trim() || undefined,
      capacidade: this.viatura.capacidade || undefined,
      status: this.viatura.status as 'ATIVA' | 'EM_MANUTENCAO' | 'RESERVADA' | 'INATIVA'
    };

    this.loading = true;
    this.viaturaService.atualizarViatura(this.viaturaId, viaturaData).subscribe({
      next: () => {
        this.mostrarNotificacao('Viatura guardada com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/viaturas', this.viaturaId]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar viatura:', error);
        this.mostrarNotificacao('Viatura não guardada. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }
}
