import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViagemService, ViagemRequest } from '../../../services/viagem.service';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

interface CargaViagem {
  cliente: string;
  descricao: string;
  quantidade: number;
  peso: string;
  encomendaRef: string;
  observacao: string;
}

@Component({
  selector: 'app-viagens-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './viagens-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-cadastro.component.css']
})
export class ViagensCadastroComponent implements OnInit {
  viagem = {
    motoristaId: null as number | null,
    viaturaId: null as number | null,
    origem: '',
    destino: '',
    dataSaida: '',
    dataChegadaPrevista: '',
    observacoes: ''
  };

  cargas: CargaViagem[] = [
    { cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '', observacao: '' }
  ];

  motoristas: Motorista[] = [];
  viaturas: Viatura[] = [];
  loading = false;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private viagemService: ViagemService,
    private motoristaService: MotoristaService,
    private viaturaService: ViaturaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarMotoristas();
    this.carregarViaturas();
  }

  carregarMotoristas() {
    this.motoristaService.listarMotoristas().subscribe({
      next: (motoristas) => {
        this.motoristas = motoristas;
      },
      error: (error) => {
        console.error('Erro ao carregar motoristas:', error);
      }
    });
  }

  carregarViaturas() {
    this.viaturaService.listarViaturas().subscribe({
      next: (viaturas) => {
        this.viaturas = viaturas;
      },
      error: (error) => {
        console.error('Erro ao carregar viaturas:', error);
      }
    });
  }

  adicionarCarga(): void {
    this.cargas.push({ cliente: '', descricao: '', quantidade: 1, peso: '', encomendaRef: '', observacao: '' });
  }

  removerCarga(index: number): void {
    if (this.cargas.length > 1) this.cargas.splice(index, 1);
  }

  salvar(): void {
    if (!this.viagem.origem || !this.viagem.destino) {
      this.mostrarNotificacao('Por favor, preencha origem e destino.', 'error');
      return;
    }

    const viagemData: ViagemRequest = {
      motorista: this.viagem.motoristaId ? { id: this.viagem.motoristaId } : undefined,
      viatura: this.viagem.viaturaId ? { id: this.viagem.viaturaId } : undefined,
      origem: this.viagem.origem,
      destino: this.viagem.destino,
      dataPartida: this.viagem.dataSaida || undefined,
      dataChegadaPrevista: this.viagem.dataChegadaPrevista || undefined,
      status: 'PLANEADA'
    };

    this.loading = true;
    this.viagemService.criarViagem(viagemData).subscribe({
      next: (viagem) => {
        this.mostrarNotificacao('Viagem guardada com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/viagens', viagem.id]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao guardar viagem:', error);
        this.mostrarNotificacao('Viagem não guardada. Tente novamente.', 'error');
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
