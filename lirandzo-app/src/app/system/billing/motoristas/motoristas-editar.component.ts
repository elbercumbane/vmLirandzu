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
      return;
    }

    this.loading = true;
    this.error = null;
    this.motoristaService.obterMotorista(this.motoristaId).subscribe({
      next: (m: Motorista) => {
        this.motorista.nome = m.nome || '';
        this.motorista.dataNascimento = m.dataNascimento || '';
        this.motorista.morada = m.morada || '';
        this.motorista.nomePai = m.nomePai || '';
        this.motorista.nomeMae = m.nomeMae || '';
        this.motorista.nuit = m.nuit || '';
        this.motorista.numeroBI = m.numeroBI || '';
        this.motorista.telefone = m.telefone || '';
        this.motorista.telefone2 = m.telefone2 || '';
        this.motorista.nomeParenteEmergencia = m.nomeParenteEmergencia || '';
        this.motorista.parentesco = m.parentesco || '';
        this.motorista.telefoneParenteEmergencia = m.telefoneParenteEmergencia || '';
        this.motorista.numeroCarta = m.numeroCarta || '';
        this.motorista.categoriaCarta = m.categoriaCarta || '';
        this.motorista.dataEmissaoCarta = m.dataEmissaoCarta || '';
        this.motorista.dataValidadeCarta = m.dataValidadeCarta || '';
        this.motorista.status = m.status || 'ACTIVE';
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar motorista:', error);
        this.loading = false;
        this.error = error.status === 404
          ? 'Motorista não encontrado'
          : error.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : `Erro ao carregar motorista: ${error.statusText || error.message}`;
        this.mostrarNotificacao(this.error, 'error');
      }
    });
  }

  mostrarNotificacao(mensagem: string, tipo: 'success' | 'error') {
    this.notificationMessage = mensagem;
    this.notificationType = tipo;
    this.showNotification = true;
    setTimeout(() => { this.showNotification = false; }, 7000);
  }

  getBackLink(): string {
    return this.motoristaId ? `/billing/motoristas/${this.motoristaId}` : '/billing/motoristas';
  }

  salvar() {
    if (this.loading || !this.motoristaId) return;

    if (!this.motorista.nome?.trim()) {
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
    this.motoristaService.atualizarMotorista(this.motoristaId, motoristaData).subscribe({
      next: () => {
        this.mostrarNotificacao('Motorista guardado com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/billing/motoristas', this.motoristaId]), 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar motorista:', error);
        this.mostrarNotificacao('Motorista não guardado. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }
}
