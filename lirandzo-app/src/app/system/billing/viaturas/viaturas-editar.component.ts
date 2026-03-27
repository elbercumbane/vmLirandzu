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
    if (!this.viaturaId) return;

    this.loading = true;
    this.error = null;
    this.viaturaService.obterViatura(this.viaturaId).subscribe({
      next: (v: Viatura) => {
        this.viatura.matricula = v.matricula || '';
        this.viatura.marca = v.marca || '';
        this.viatura.modelo = v.modelo || '';
        this.viatura.ano = v.ano ?? null;
        this.viatura.cor = v.cor || '';
        const tipoVal = v.tipo || '';
        if (tipoVal.startsWith('Outros - ')) {
          this.viatura.tipo = 'Outros';
          this.tipoOutros = tipoVal.replace('Outros - ', '');
        } else {
          this.viatura.tipo = tipoVal;
          this.tipoOutros = '';
        }
        this.viatura.capacidade = v.capacidade ?? null;
        this.viatura.capacidadeUnidade = v.capacidadeUnidade || 'KG';
        this.viatura.combustivel = v.combustivel || '';
        this.viatura.numeroChassis = v.numeroChassis || '';
        this.viatura.status = v.status || 'ACTIVE';
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar viatura:', error);
        this.loading = false;
        this.error = error.status === 404 ? 'Viatura não encontrada' : error.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : `Erro ao carregar viatura: ${error.statusText || error.message}`;
        this.mostrarNotificacao(this.error, 'error');
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

  mostrarNotificacao(mensagem: string, tipo: 'success' | 'error') {
    this.notificationMessage = mensagem;
    this.notificationType = tipo;
    this.showNotification = true;
    setTimeout(() => { this.showNotification = false; }, 7000);
  }

  getBackLink(): string {
    return this.viaturaId ? `/billing/viaturas/${this.viaturaId}` : '/billing/viaturas';
  }

  salvar() {
    if (!this.viatura.matricula?.trim() || !this.viatura.marca?.trim() || !this.viatura.modelo?.trim()) {
      this.mostrarNotificacao('Preencha matrícula, marca e modelo.', 'error');
      return;
    }
    if (!this.viaturaId) return;

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
    this.viaturaService.atualizarViatura(this.viaturaId, viaturaData).subscribe({
      next: () => {
        this.mostrarNotificacao('Viatura actualizada com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/billing/viaturas', this.viaturaId]), 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar viatura:', error);
        this.mostrarNotificacao('Viatura não guardada. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }
}
