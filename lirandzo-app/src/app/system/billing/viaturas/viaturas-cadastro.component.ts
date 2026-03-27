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
    ano: null as number | null,
    cor: '',
    tipo: '',
    capacidade: null as number | null,
    capacidadeUnidade: 'KG',
    combustivel: '',
    numeroChassis: '',
    status: 'ACTIVE'
  };

  tiposViatura = ['Camião Pesado', 'Camião Médio', 'Camião Leve', 'Carro ligeiro', 'Carro comercial', 'Reboque', 'Semi-Reboque', 'Outros'];
  tipoOutros = '';

  loading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private viaturaService: ViaturaService,
    private router: Router
  ) {}

  salvar() {
    if (!this.viatura.matricula?.trim()) {
      this.mostrarNotificacao('Por favor, preencha a matrícula.', 'error');
      return;
    }
    if (!this.viatura.marca?.trim()) {
      this.mostrarNotificacao('Por favor, preencha a marca.', 'error');
      return;
    }
    if (!this.viatura.modelo?.trim()) {
      this.mostrarNotificacao('Por favor, preencha o modelo.', 'error');
      return;
    }

    const viaturaData: Viatura = {
      matricula: this.viatura.matricula.trim(),
      marca: this.viatura.marca.trim(),
      modelo: this.viatura.modelo.trim(),
      ano: this.viatura.ano || undefined,
      cor: this.viatura.cor?.trim() || undefined,
      tipo: this.obterTipoParaGuardar(),
      capacidade: this.viatura.capacidade || undefined,
      capacidadeUnidade: this.viatura.capacidadeUnidade || 'KG',
      combustivel: this.viatura.combustivel?.trim() || undefined,
      numeroChassis: this.viatura.numeroChassis?.trim() || undefined,
      status: this.viatura.status
    };

    this.loading = true;
    this.viaturaService.criarViatura(viaturaData).subscribe({
      next: (viatura) => {
        this.mostrarNotificacao('Viatura registada com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/billing/viaturas', viatura.id]), 1500);
      },
      error: (error) => {
        console.error('Erro ao guardar viatura:', error);
        this.mostrarNotificacao('Viatura não guardada. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }

  obterTipoParaGuardar(): string | undefined {
    const t = this.viatura.tipo?.trim();
    if (!t) return undefined;
    if (t === 'Outros' && this.tipoOutros?.trim()) {
      return `Outros - ${this.tipoOutros.trim()}`;
    }
    return t;
  }

  mostrarNotificacao(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => { this.showNotification = false; }, 7000);
  }
}
