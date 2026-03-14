import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { GuiaRemessaService, GuiaRemessaRequest, GuiaRemessaResponse, ItemGuiaRemessaRequest } from '../../../services/guia-remessa.service';
import { MotoristaService, Motorista } from '../../../services/motorista.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { EncomendaService } from '../../../services/encomenda.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import html2pdf from 'html2pdf.js';

interface CargaGuia {
  clienteNome: string;
  clienteId: number | null;
  descricao: string;
  quantidade: number;
  peso: string;
  encomendaRef: string;
  encomendaId: number | null;
}

@Component({
  selector: 'app-guias-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './guias-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './guias-cadastro.component.css']
})
export class GuiasCadastroComponent implements OnInit {
  guia = {
    referencia: '',
    data: new Date().toISOString().split('T')[0],
    motoristaId: null as number | null,
    viaturaId: null as number | null,
    viagemId: null as number | null,
    origem: '',
    destino: '',
    kmSaida: null as number | null,
    kmChegada: null as number | null,
    observacoes: ''
  };

  cargas: CargaGuia[] = [
    { clienteNome: '', clienteId: null, descricao: '', quantidade: 1, peso: '', encomendaRef: '', encomendaId: null }
  ];

  motoristas: Motorista[] = [];
  viaturas: Viatura[] = [];
  loading = false;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showPreview = false;
  ultimaGuiaId: number | null = null;

  constructor(
    private guiaRemessaService: GuiaRemessaService,
    private motoristaService: MotoristaService,
    private viaturaService: ViaturaService,
    private clienteService: ClienteService,
    private encomendaService: EncomendaService,
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
    this.cargas.push({ clienteNome: '', clienteId: null, descricao: '', quantidade: 1, peso: '', encomendaRef: '', encomendaId: null });
  }

  removerCarga(i: number): void {
    if (this.cargas.length > 1) this.cargas.splice(i, 1);
  }

  guardarGuia(): void {
    if (!this.guia.origem || !this.guia.destino) {
      this.mostrarNotificacao('Por favor, preencha origem e destino.', 'error');
      return;
    }

    if (this.cargas.length === 0 || !this.cargas.some(c => c.descricao.trim())) {
      this.mostrarNotificacao('Por favor, adicione pelo menos uma carga com descrição.', 'error');
      return;
    }

    // Processar cargas e criar/buscar clientes e encomendas
    this.processarCargas().then((itens) => {
      const guiaData: GuiaRemessaRequest = {
        motorista: this.guia.motoristaId ? { id: this.guia.motoristaId } : undefined,
        viatura: this.guia.viaturaId ? { id: this.guia.viaturaId } : undefined,
        viagem: this.guia.viagemId ? { id: this.guia.viagemId } : undefined,
        origem: this.guia.origem,
        destino: this.guia.destino,
        kmSaida: this.guia.kmSaida || undefined,
        kmChegada: this.guia.kmChegada || undefined,
        observacoes: this.guia.observacoes || undefined,
        dataGuia: this.guia.data || new Date().toISOString().split('T')[0],
        status: 'EM_TRANSITO',
        itens: itens
      };

      this.loading = true;
      this.guiaRemessaService.criarGuiaRemessa(guiaData).subscribe({
        next: (guia) => {
          this.ultimaGuiaId = guia.id;
          this.guia.referencia = guia.referencia;
          this.mostrarNotificacao('Guia guardada com sucesso!', 'success');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao guardar guia:', error);
          const errorMessage = error.error?.message || error.message || 'Erro desconhecido';
          console.error('Detalhes do erro:', error.error);
          this.mostrarNotificacao(`Guia não guardada: ${errorMessage}`, 'error');
          this.loading = false;
        }
      });
    }).catch((error) => {
      console.error('Erro ao processar cargas:', error);
      this.mostrarNotificacao('Erro ao processar cargas. Tente novamente.', 'error');
    });
  }

  private async processarCargas(): Promise<ItemGuiaRemessaRequest[]> {
    const itens: ItemGuiaRemessaRequest[] = [];

    for (const carga of this.cargas) {
      if (!carga.descricao.trim()) continue;

      let clienteId: number | null = null;
      let encomendaId: number | null = null;

      // Buscar ou criar cliente
      if (carga.clienteNome.trim()) {
        clienteId = await this.criarOuBuscarCliente(carga.clienteNome);
      }

      // Buscar encomenda por referência se fornecida
      if (carga.encomendaRef.trim()) {
        encomendaId = await this.buscarEncomendaPorRef(carga.encomendaRef);
      }

      itens.push({
        cliente: clienteId ? { id: clienteId } : undefined,
        encomenda: encomendaId ? { numeroEncomenda: encomendaId } : undefined,
        descricao: carga.descricao,
        quantidade: carga.quantidade,
        peso: carga.peso || undefined,
        observacao: undefined
      });
    }

    return itens;
  }

  private criarOuBuscarCliente(nome: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      this.clienteService.buscarClientes(nome).subscribe({
        next: (clientes: Cliente[]) => {
          if (clientes && clientes.length > 0) {
            const clienteEncontrado = clientes.find((c: Cliente) =>
              c.nome?.toLowerCase() === nome.toLowerCase()
            ) || clientes[0];

            if (clienteEncontrado.id) {
              resolve(clienteEncontrado.id);
            } else {
              this.criarNovoCliente(nome).then(resolve).catch(reject);
            }
          } else {
            this.criarNovoCliente(nome).then(resolve).catch(reject);
          }
        },
        error: (error: unknown) => {
          console.error('Erro ao buscar cliente:', error);
          this.criarNovoCliente(nome).then(resolve).catch(reject);
        }
      });
    });
  }

  private criarNovoCliente(nome: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const clienteData: Cliente = {
        nome: nome,
        telefone: '',
        email: '',
        endereco: '',
        nif: ''
      };

      this.clienteService.criarCliente(clienteData).subscribe({
        next: (cliente: Cliente) => {
          if (cliente.id) {
            resolve(cliente.id);
          } else {
            reject(new Error('Cliente criado mas sem ID'));
          }
        },
        error: (error: unknown) => {
          console.error('Erro ao criar cliente:', error);
          reject(error);
        }
      });
    });
  }

  private buscarEncomendaPorRef(ref: string): Promise<number | null> {
    return new Promise((resolve) => {
      // Tentar extrair número da referência (ex: ENC-001 ou VML-0001)
      const numeroMatch = ref.match(/\d+/);
      if (numeroMatch) {
        const numero = parseInt(numeroMatch[0], 10);
        this.encomendaService.obterEncomenda(numero).subscribe({
          next: (encomenda) => {
            resolve(encomenda.numeroEncomenda);
          },
          error: () => {
            resolve(null); // Se não encontrar, continua sem encomenda
          }
        });
      } else {
        resolve(null);
      }
    });
  }

  gerarGuiaPDF(): void {
    if (!this.guia.referencia) {
      this.mostrarNotificacao('Por favor, guarde a guia primeiro antes de gerar o PDF.', 'error');
      return;
    }

    this.showPreview = true;
  }

  fecharPreview(): void {
    this.showPreview = false;
  }

  guardarPDF(): void {
    const element = document.getElementById('guia-preview-content');
    if (!element) {
      this.mostrarNotificacao('Erro ao gerar PDF: conteúdo não encontrado.', 'error');
      return;
    }

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Guia_${this.guia.referencia || 'Nova'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      this.mostrarNotificacao('PDF gerado e guardado com sucesso!', 'success');
      this.fecharPreview();
    }).catch((error: unknown) => {
      console.error('Erro ao gerar PDF:', error);
      this.mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
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

  formatarData(data: string | null | undefined): string {
    if (!data) return 'N/A';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return data;
    }
  }

  getMotoristaNome(): string {
    if (!this.guia.motoristaId) return 'N/A';
    // Garantir comparação correta de tipos (number)
    const motoristaId = Number(this.guia.motoristaId);
    const motorista = this.motoristas.find(m => m.id && Number(m.id) === motoristaId);
    if (motorista && motorista.nome) {
      return motorista.nome;
    }
    return 'N/A';
  }

  getViaturaDescricao(): string {
    if (!this.guia.viaturaId) return 'N/A';
    // Garantir comparação correta de tipos (number)
    const viaturaId = Number(this.guia.viaturaId);
    const viatura = this.viaturas.find(v => v.id && Number(v.id) === viaturaId);
    if (viatura) {
      const matricula = viatura.matricula || '';
      const marca = viatura.marca || '';
      const modelo = viatura.modelo || '';
      if (matricula && marca && modelo) {
        return `${matricula} (${marca} ${modelo})`;
      } else if (matricula) {
        return matricula;
      } else if (marca && modelo) {
        return `${marca} ${modelo}`;
      }
    }
    return 'N/A';
  }
}
