import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViagemService, ViagemRequest, ViagemResponse } from '../../../services/viagem.service';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-viagens-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './viagens-editar.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-cadastro.component.css']
})
export class ViagensEditarComponent implements OnInit {
  viagem = {
    motoristaId: null as number | null,
    viaturaId: null as number | null,
    origem: '',
    destino: '',
    dataSaida: '',
    dataChegadaPrevista: '',
    dataChegadaReal: '',
    status: 'PLANEADA',
    combustivelConsumido: null as number | null,
    custoCombustivel: null as number | null,
    observacoes: ''
  };

  motoristas: Motorista[] = [];
  viaturas: Viatura[] = [];
  loading = true;
  error: string | null = null;
  viagemId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viagemService: ViagemService,
    private motoristaService: MotoristaService,
    private viaturaService: ViaturaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viagemId = +id;
      this.carregarMotoristas();
      this.carregarViaturas();
      this.carregarViagem();
    } else {
      this.loading = false;
      this.mostrarNotificacao('ID da viagem não fornecido', 'error');
    }
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

  carregarViagem() {
    if (!this.viagemId) {
      this.error = 'ID da viagem não fornecido';
      this.loading = false;
      this.mostrarNotificacao('ID da viagem não fornecido', 'error');
      return;
    }

    this.loading = true;
    this.error = null;
    this.viagemService.obterViagem(this.viagemId).subscribe({
      next: (viagemApi: ViagemResponse) => {
        try {
          this.viagem.motoristaId = viagemApi.motorista?.id || null;
          this.viagem.viaturaId = viagemApi.viatura?.id || null;
          this.viagem.origem = viagemApi.origem || '';
          this.viagem.destino = viagemApi.destino || '';
          this.viagem.status = viagemApi.status || 'PLANEADA';
          this.viagem.combustivelConsumido = viagemApi.combustivelConsumido || null;
          this.viagem.custoCombustivel = viagemApi.custoCombustivel || null;

          if (viagemApi.dataPartida) {
            try {
              const dataObj = new Date(viagemApi.dataPartida);
              if (!isNaN(dataObj.getTime())) {
                this.viagem.dataSaida = dataObj.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn('Erro ao formatar data partida:', e);
            }
          }

          if (viagemApi.dataChegadaPrevista) {
            try {
              const dataObj = new Date(viagemApi.dataChegadaPrevista);
              if (!isNaN(dataObj.getTime())) {
                this.viagem.dataChegadaPrevista = dataObj.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn('Erro ao formatar data chegada prevista:', e);
            }
          }

          if (viagemApi.dataChegadaReal) {
            try {
              const dataObj = new Date(viagemApi.dataChegadaReal);
              if (!isNaN(dataObj.getTime())) {
                this.viagem.dataChegadaReal = dataObj.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn('Erro ao formatar data chegada real:', e);
            }
          }

          this.loading = false;
        } catch (error) {
          console.error('Erro ao processar dados da viagem:', error);
          this.loading = false;
          this.error = 'Erro ao processar dados da viagem';
          this.mostrarNotificacao('Erro ao processar dados da viagem', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar viagem:', error);
        this.loading = false;
        const mensagemErro = error.status === 404 
          ? 'Viagem não encontrada' 
          : error.status === 0
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
          : `Erro ao carregar viagem: ${error.statusText || error.message}`;
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
    return this.viagemId ? `/billing/viagens/${this.viagemId}` : '/billing/viagens';
  }

  salvar() {
    if (!this.viagem.origem || !this.viagem.destino) {
      this.mostrarNotificacao('Por favor, preencha origem e destino.', 'error');
      return;
    }

    if (!this.viagemId) {
      this.mostrarNotificacao('Viagem não guardada', 'error');
      return;
    }

    const viagemData: ViagemRequest = {
      motorista: this.viagem.motoristaId ? { id: this.viagem.motoristaId } : undefined,
      viatura: this.viagem.viaturaId ? { id: this.viagem.viaturaId } : undefined,
      origem: this.viagem.origem,
      destino: this.viagem.destino,
      dataPartida: this.viagem.dataSaida || undefined,
      dataChegadaPrevista: this.viagem.dataChegadaPrevista || undefined,
      dataChegadaReal: this.viagem.dataChegadaReal || undefined,
      status: this.viagem.status,
      combustivelConsumido: this.viagem.combustivelConsumido || undefined,
      custoCombustivel: this.viagem.custoCombustivel || undefined
    };

    this.loading = true;
    this.viagemService.atualizarViagem(this.viagemId, viagemData).subscribe({
      next: () => {
        this.mostrarNotificacao('Viagem guardada com sucesso!', 'success');
        setTimeout(() => {
          this.router.navigate(['/billing/viagens', this.viagemId]);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar viagem:', error);
        this.mostrarNotificacao('Viagem não guardada. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }
}
