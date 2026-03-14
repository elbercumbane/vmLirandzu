import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-motoristas-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './motoristas-editar.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-cadastro.component.css']
})
export class MotoristasEditarComponent implements OnInit {
  motorista = {
    nome: '',
    telefone: '',
    numeroCarta: '',
    status: 'ATIVO'
  };

  loading = true;
  error: string | null = null;
  motoristaId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private motoristaService: MotoristaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.motoristaId = +id;
      this.carregarMotorista();
    } else {
      this.loading = false;
      this.mostrarNotificacao('ID do motorista não fornecido', 'error');
    }
  }

  carregarMotorista() {
    if (!this.motoristaId) {
      this.error = 'ID do motorista não fornecido';
      this.loading = false;
      this.mostrarNotificacao('ID do motorista não fornecido', 'error');
      return;
    }

    this.loading = true;
    this.error = null;
    this.motoristaService.obterMotorista(this.motoristaId).subscribe({
      next: (motoristaApi: Motorista) => {
        try {
          this.motorista.nome = motoristaApi.nome || '';
          this.motorista.telefone = motoristaApi.telefone || '';
          this.motorista.numeroCarta = motoristaApi.numeroCarta || '';
          this.motorista.status = motoristaApi.status || 'ATIVO';
          this.loading = false;
        } catch (error) {
          console.error('Erro ao processar dados do motorista:', error);
          this.loading = false;
          this.error = 'Erro ao processar dados do motorista';
          this.mostrarNotificacao('Erro ao processar dados do motorista', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar motorista:', error);
        this.loading = false;
        const mensagemErro = error.status === 404 
          ? 'Motorista não encontrado' 
          : error.status === 0
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
          : `Erro ao carregar motorista: ${error.statusText || error.message}`;
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
    return this.motoristaId ? `/billing/motoristas/${this.motoristaId}` : '/billing/motoristas';
  }

  salvar() {
    // Prevenir dupla submissão
    if (this.loading) {
      return;
    }

    if (!this.motorista.nome || !this.motorista.nome.trim()) {
      this.mostrarNotificacao('Por favor, preencha o nome do motorista.', 'error');
      return;
    }

    if (!this.motoristaId) {
      this.mostrarNotificacao('Motorista não guardado', 'error');
      return;
    }

    const motoristaData: Motorista = {
      nome: this.motorista.nome.trim(),
      telefone: this.motorista.telefone?.trim() || undefined,
      numeroCarta: this.motorista.numeroCarta?.trim() || undefined,
      status: this.motorista.status as 'ATIVO' | 'INATIVO'
    };

    this.loading = true;
    this.motoristaService.atualizarMotorista(this.motoristaId, motoristaData).subscribe({
      next: () => {
        this.mostrarNotificacao('Motorista guardado com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/motoristas', this.motoristaId]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar motorista:', error);
        this.mostrarNotificacao('Motorista não guardado. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }
}
