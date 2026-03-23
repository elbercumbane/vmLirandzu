import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-motoristas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './motoristas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-cadastro.component.css']
})
export class MotoristasCadastroComponent {
  motorista = {
    nome: '',
    dataNascimento: '',
    morada: '',
    nomePai: '',
    nomeMae: '',
    nuit: '',
    numeroBI: '',
    telefone: '',
    telefone2: '',
    nomeParenteEmergencia: '',
    parentesco: '',
    telefoneParenteEmergencia: '',
    numeroCarta: '',
    categoriaCarta: '',
    dataEmissaoCarta: '',
    dataValidadeCarta: '',
    status: 'ACTIVE'
  };

  loading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private motoristaService: MotoristaService,
    private router: Router
  ) {}

  salvar() {
    if (this.loading) return;

    if (!this.motorista.nome || !this.motorista.nome.trim()) {
      this.mostrarNotificacao('Por favor, preencha o nome do motorista.', 'error');
      return;
    }

    const motoristaData: Motorista = {
      nome: this.motorista.nome.trim(),
      dataNascimento: this.motorista.dataNascimento || undefined,
      morada: this.motorista.morada?.trim() || undefined,
      nomePai: this.motorista.nomePai?.trim() || undefined,
      nomeMae: this.motorista.nomeMae?.trim() || undefined,
      nuit: this.motorista.nuit?.trim() || undefined,
      numeroBI: this.motorista.numeroBI?.trim() || undefined,
      telefone: this.motorista.telefone?.trim() || undefined,
      telefone2: this.motorista.telefone2?.trim() || undefined,
      nomeParenteEmergencia: this.motorista.nomeParenteEmergencia?.trim() || undefined,
      parentesco: this.motorista.parentesco?.trim() || undefined,
      telefoneParenteEmergencia: this.motorista.telefoneParenteEmergencia?.trim() || undefined,
      numeroCarta: this.motorista.numeroCarta?.trim() || undefined,
      categoriaCarta: this.motorista.categoriaCarta || undefined,
      dataEmissaoCarta: this.motorista.dataEmissaoCarta || undefined,
      dataValidadeCarta: this.motorista.dataValidadeCarta || undefined,
      status: this.motorista.status as 'ACTIVE' | 'INACTIVE'
    };

    this.loading = true;
    this.motoristaService.criarMotorista(motoristaData).subscribe({
      next: (motorista) => {
        this.mostrarNotificacao('Motorista guardado com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/motoristas', motorista.id]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao guardar motorista:', error);
        this.mostrarNotificacao('Motorista não guardado. Tente novamente.', 'error');
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
