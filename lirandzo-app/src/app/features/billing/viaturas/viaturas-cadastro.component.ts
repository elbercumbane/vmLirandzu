import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-viaturas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './viaturas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-cadastro.component.css']
})
export class ViaturasCadastroComponent {
  viatura = {
    matricula: '',
    marca: '',
    modelo: '',
    tipo: '',
    capacidade: null as number | null,
    status: 'ATIVA'
  };

  tiposViatura = ['Camião Pesado', 'Camião Médio', 'Camião Leve', 'Reboque', 'Semi-Reboque'];

  loading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private viaturaService: ViaturaService,
    private router: Router
  ) {}

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

    const viaturaData: Viatura = {
      matricula: this.viatura.matricula.trim(),
      marca: this.viatura.marca.trim(),
      modelo: this.viatura.modelo.trim(),
      tipo: this.viatura.tipo?.trim() || undefined,
      capacidade: this.viatura.capacidade || undefined,
      status: this.viatura.status as 'ATIVA' | 'EM_MANUTENCAO' | 'RESERVADA' | 'INATIVA'
    };

    this.loading = true;
    this.viaturaService.criarViatura(viaturaData).subscribe({
      next: (viatura) => {
        this.mostrarNotificacao('Viatura guardada com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/viaturas', viatura.id]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao guardar viatura:', error);
        this.mostrarNotificacao('Viatura não guardada. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }

  mostrarNotificacao(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 7000);
  }
}
