import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoRequest, CotacaoResponse } from '../../../services/cotacao.service';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import html2pdf from 'html2pdf.js';

interface ItemCotacao {
  descricao: string;
  quantidade: number;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-cotacoes-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './cotacoes-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-cadastro.component.css']
})
export class CotacoesCadastroComponent implements OnInit {

  cotacao = {
    referencia: '',
    data: new Date().toISOString().split('T')[0],
    validade: '',
    operador: '',
    clienteNome: '',
    clienteContacto: '',
    clienteTelefone: '',
    clienteEmail: '',
    origem: '',
    destino: '',
    tipoVeiculo: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    observacoes: '',
    condicoes: 'Entrega condicionada a pagamento. Preços sujeitos a alteração sem aviso prévio.'
  };

  itens: ItemCotacao[] = [
    { descricao: '', quantidade: 1, precoUnitario: null }
  ];

  operadores = ['Ana Silva', 'João Macuácua', 'Alberto Chissano', 'Mário Tembe'];
  tiposVeiculo = ['Camião Pesado (+16t)', 'Camião Médio (7.5-16t)', 'Camião Leve (até 7.5t)', 'Semi-Reboque'];

  // Notificação
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  // Preview modal
  showPreview: boolean = false;

  // Modal de opções de envio
  showEnvioModal: boolean = false;

  ultimaCotacaoId: number | null = null;
  private ultimaCotacaoRef: string = '';

  constructor(
    private cotacaoService: CotacaoService,
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar se há um ID na rota (pedido existente)
    this.route.params.subscribe(params => {
      const pedidoId = params['id'];
      if (pedidoId) {
        this.carregarDadosPedido(Number(pedidoId));
      }
    });
  }

  carregarDadosPedido(pedidoId: number): void {
    this.cotacaoService.obterCotacao(pedidoId).subscribe({
      next: (cotacao: CotacaoResponse) => {
        // Preencher automaticamente os dados do pedido
        if (cotacao.cliente) {
          this.cotacao.clienteNome = cotacao.cliente.nome || '';
          this.cotacao.clienteTelefone = cotacao.cliente.telefone || '';
          this.cotacao.clienteEmail = cotacao.cliente.email || '';
        }
        
        // Preencher origem e destino
        this.cotacao.origem = cotacao.origem || '';
        this.cotacao.destino = cotacao.destino || '';
        
        // Preencher tipo de veículo se existir
        if (cotacao.tipoVeiculo) {
          this.cotacao.tipoVeiculo = cotacao.tipoVeiculo;
        }
        
        // Preencher descrição da carga (mensagem do pedido) como primeiro item
        if (cotacao.descricaoCarga) {
          this.itens = [
            { descricao: cotacao.descricaoCarga, quantidade: 1, precoUnitario: null }
          ];
        }
        
        // Preencher observações se existirem
        if (cotacao.observacoes) {
          this.cotacao.observacoes = cotacao.observacoes;
        }
        
        // Guardar o ID da cotação para atualização posterior
        this.ultimaCotacaoId = cotacao.id;
        this.cotacao.referencia = cotacao.referencia || '';
        this.ultimaCotacaoRef = cotacao.referencia || '';
        
        this.mostrarNotificacao('Dados do pedido carregados automaticamente', 'success');
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar dados do pedido:', error);
        this.mostrarNotificacao('Erro ao carregar dados do pedido. Pode preencher manualmente.', 'error');
      }
    });
  }

  adicionarItem(): void {
    this.itens.push({ descricao: '', quantidade: 1, precoUnitario: null });
  }

  removerItem(i: number): void {
    if (this.itens.length > 1) this.itens.splice(i, 1);
  }

  getSubtotalItem(item: ItemCotacao): number {
    return item.quantidade * (item.precoUnitario || 0);
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return (this.cotacao.custoTransporte || 0) + (this.cotacao.custoRecolha || 0) + (this.cotacao.custoBillOfEntry || 0);
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  guardarCotacao(): void {
    if (!this.cotacao.clienteNome || !this.cotacao.origem || !this.cotacao.destino) {
      this.mostrarNotificacao('Por favor, preencha os dados do cliente e rota (origem e destino).', 'error');
      return;
    }
    
    // Avisar se não há valores, mas permitir guardar
    if (this.totalGeral <= 0) {
      const confirmar = confirm('A cotação não tem valores preenchidos. Deseja guardar mesmo assim? Pode adicionar valores depois.');
      if (!confirmar) {
        return;
      }
    }

    this.criarOuBuscarCliente().then(clienteId => {
      if (!clienteId) {
        this.mostrarNotificacao('Cotação não guardada', 'error');
        return;
      }

      const descricaoCarga = this.itens
        .filter(i => i.descricao?.trim())
        .map(i => `${i.quantidade}x ${i.descricao}`)
        .join(', ');

      const payload: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral || undefined,
        custoTransporte: this.cotacao.custoTransporte || undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        custoBillOfEntry: this.cotacao.custoBillOfEntry || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: 'PENDENTE',
        observacoes: this.cotacao.observacoes || undefined,
        condicoes: this.cotacao.condicoes || undefined,
        operador: this.cotacao.operador || undefined
      };

      // Se já existe uma cotação (vindo de um pedido), atualizar em vez de criar nova
      if (this.ultimaCotacaoId) {
        this.cotacaoService.atualizarCotacao(this.ultimaCotacaoId, payload).subscribe({
          next: (res: CotacaoResponse) => {
            this.ultimaCotacaoId = res.id;
            this.cotacao.referencia = res.referencia || '';
            this.ultimaCotacaoRef = res.referencia || '';
            this.mostrarNotificacao('Cotação atualizada com sucesso', 'success');
          },
          error: (error: unknown) => {
            console.error('Erro ao atualizar cotação:', error);
            this.mostrarNotificacao('Erro ao atualizar cotação', 'error');
          }
        });
      } else {
        // Criar nova cotação
        this.cotacaoService.criarCotacao(payload).subscribe({
          next: (res: CotacaoResponse) => {
            this.ultimaCotacaoId = res.id;
            this.cotacao.referencia = res.referencia || '';
            this.ultimaCotacaoRef = res.referencia || '';
            this.mostrarNotificacao('Cotação guardada com sucesso', 'success');
          },
          error: (error: unknown) => {
            console.error('Erro ao guardar cotação:', error);
            this.mostrarNotificacao('Cotação não guardada', 'error');
          }
        });
      }
    }).catch(error => {
      console.error('Erro ao criar/buscar cliente:', error);
      this.mostrarNotificacao('Cotação não guardada', 'error');
    });
  }

  gerarCotacaoPDF(): void {
    // Verificar se a cotação foi guardada
    if (!this.cotacao.referencia && !this.ultimaCotacaoRef) {
      this.mostrarNotificacao('Por favor, guarde a cotação primeiro antes de gerar o PDF.', 'error');
      return;
    }

    // Se não tem referência ainda, usar a última guardada
    if (!this.cotacao.referencia && this.ultimaCotacaoRef) {
      this.cotacao.referencia = this.ultimaCotacaoRef;
    }

    // Mostrar preview
    this.showPreview = true;
  }

  abrirModalEnvio(): void {
    // Verificar se a cotação foi guardada, se não, guardar primeiro
    if (!this.ultimaCotacaoId) {
      // Tentar guardar primeiro
      if (!this.cotacao.clienteNome || !this.cotacao.origem || !this.cotacao.destino) {
        this.mostrarNotificacao('Por favor, preencha os dados do cliente e rota antes de enviar.', 'error');
        return;
      }
      
      // Guardar automaticamente antes de abrir o modal
      // Criar uma Promise para aguardar o guardar
      this.criarOuBuscarCliente().then(clienteId => {
        if (!clienteId) {
          this.mostrarNotificacao('Erro ao obter dados do cliente.', 'error');
          return;
        }

        const descricaoCarga = this.itens
          .filter(i => i.descricao?.trim())
          .map(i => `${i.quantidade}x ${i.descricao}`)
          .join(', ');

        const payload: CotacaoRequest = {
          cliente: { id: clienteId },
          origem: this.cotacao.origem,
          destino: this.cotacao.destino,
          tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
          descricaoCarga: descricaoCarga || undefined,
          valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
          custoTransporte: this.cotacao.custoTransporte || undefined,
          custoRecolha: this.cotacao.custoRecolha || undefined,
          custoBillOfEntry: this.cotacao.custoBillOfEntry || undefined,
          dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
          dataValidade: this.cotacao.validade || undefined,
          status: 'PENDENTE',
          observacoes: this.cotacao.observacoes || undefined,
          condicoes: this.cotacao.condicoes || undefined,
          operador: this.cotacao.operador || undefined
        };

        this.cotacaoService.criarCotacao(payload).subscribe({
          next: (res: CotacaoResponse) => {
            this.ultimaCotacaoId = res.id;
            this.cotacao.referencia = res.referencia || '';
            this.ultimaCotacaoRef = res.referencia || '';
            this.showEnvioModal = true;
          },
          error: (error: unknown) => {
            console.error('Erro ao guardar cotação:', error);
            this.mostrarNotificacao('Erro ao guardar cotação. Tente novamente.', 'error');
          }
        });
      }).catch(error => {
        console.error('Erro ao criar/buscar cliente:', error);
        this.mostrarNotificacao('Erro ao obter dados do cliente.', 'error');
      });
      return;
    }
    this.showEnvioModal = true;
  }

  fecharModalEnvio(): void {
    this.showEnvioModal = false;
  }

  enviarViaWhatsApp(): void {
    if (!this.ultimaCotacaoId) return;

    const telefone = this.cotacao.clienteTelefone?.replace(/\D/g, '') || '';
    if (!telefone) {
      this.mostrarNotificacao('Telefone do cliente não disponível para WhatsApp.', 'error');
      return;
    }

    const texto = this.gerarTextoWhatsApp();
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');

    this.marcarComoEnviada('whatsapp', 'Cotação enviada via WhatsApp e guardada com sucesso!');
    this.fecharModalEnvio();
  }

  imprimirCotacao(): void {
    if (!this.ultimaCotacaoId) return;

    // Marcar como enviada antes de imprimir
    this.marcarComoEnviada('pdf', 'Cotação enviada (PDF) e guardada com sucesso!');
    this.fecharModalEnvio();
    
    // Mostrar preview primeiro
    this.showPreview = true;
    // Depois de um pequeno delay, imprimir
    setTimeout(() => {
      window.print();
    }, 500);
  }

  guardarComoEnviada(): void {
    if (!this.ultimaCotacaoId) return;

    this.marcarComoEnviada('pdf', 'Cotação guardada e marcada como enviada com sucesso!');
    this.fecharModalEnvio();
  }

  marcarComoChamada(): void {
    console.log('marcarComoChamada chamado, ultimaCotacaoId:', this.ultimaCotacaoId);
    
    if (!this.ultimaCotacaoId) {
      console.error('Erro: ultimaCotacaoId não está definido em marcarComoChamada');
      this.mostrarNotificacao('Erro: Cotação não foi guardada. Por favor, guarde primeiro.', 'error');
      return;
    }

    this.marcarComoEnviada('chamada', 'Cotação marcada como enviada via chamada e guardada com sucesso!');
    this.fecharModalEnvio();
  }

  private marcarComoEnviada(formaEnvio: 'whatsapp' | 'pdf' | 'chamada', mensagemSucesso?: string): void {
    console.log('marcarComoEnviada chamado com formaEnvio:', formaEnvio, 'ultimaCotacaoId:', this.ultimaCotacaoId);
    
    if (!this.ultimaCotacaoId) {
      console.error('Erro: ultimaCotacaoId não está definido');
      this.mostrarNotificacao('Erro: Cotação não foi guardada. Por favor, guarde primeiro.', 'error');
      return;
    }

    const cotacaoId = this.ultimaCotacaoId;

    // Primeiro garantir que temos um cliente válido
    this.criarOuBuscarCliente().then(clienteId => {
      if (!clienteId) {
        this.mostrarNotificacao('Erro ao obter dados do cliente.', 'error');
        return;
      }

      // Usar os dados atuais do formulário, não os da BD
      const descricaoCarga = this.itens
        .filter(i => i.descricao?.trim())
        .map(i => `${i.quantidade}x ${i.descricao}`)
        .join(', ');

      const atualizacao: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
        custoTransporte: this.cotacao.custoTransporte || undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        custoBillOfEntry: this.cotacao.custoBillOfEntry || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: 'COTACAO_GERADA',
        observacoes: this.cotacao.observacoes || undefined,
        condicoes: this.cotacao.condicoes || undefined,
        operador: this.cotacao.operador || undefined,
        formaEnvioRealizada: formaEnvio
      };

      // Obter formaEnvioPreferida da cotação existente se existir
      this.cotacaoService.obterCotacao(cotacaoId).subscribe({
        next: (cotacao: CotacaoResponse) => {
          atualizacao.formaEnvioPreferida = cotacao.formaEnvioPreferida || undefined;
          
          // Atualizar via PUT com formaEnvioRealizada
          console.log('Atualizando cotação com dados:', atualizacao);
          this.cotacaoService.atualizarCotacao(cotacaoId, atualizacao).subscribe({
            next: (res) => {
              console.log('Cotação atualizada com sucesso:', res);
              // Mostrar notificação de sucesso
              const mensagem = mensagemSucesso || 'Cotação enviada e guardada com sucesso!';
              this.mostrarNotificacao(mensagem, 'success');
              
              // Redirecionar para cotações enviadas após 1.5 segundos
              setTimeout(() => {
                this.router.navigate(['/billing/cotacoes/enviadas']);
              }, 1500);
            },
            error: (error: unknown) => {
              console.error('Erro ao marcar como enviada:', error);
              this.mostrarNotificacao('Erro ao atualizar estado da cotação.', 'error');
            }
          });
        },
        error: (error: unknown) => {
          console.error('Erro ao obter cotação:', error);
          // Tentar atualizar mesmo assim sem formaEnvioPreferida
          this.cotacaoService.atualizarCotacao(cotacaoId, atualizacao).subscribe({
            next: () => {
              const mensagem = mensagemSucesso || 'Cotação enviada e guardada com sucesso!';
              this.mostrarNotificacao(mensagem, 'success');
              
              // Redirecionar para cotações enviadas após 1.5 segundos
              setTimeout(() => {
                this.router.navigate(['/billing/cotacoes/enviadas']);
              }, 1500);
            },
            error: (updateError: unknown) => {
              console.error('Erro ao atualizar cotação:', updateError);
              this.mostrarNotificacao('Erro ao guardar cotação.', 'error');
            }
          });
        }
      });
    }).catch(error => {
      console.error('Erro ao criar/buscar cliente:', error);
      this.mostrarNotificacao('Erro ao obter dados do cliente.', 'error');
    });
  }

  private gerarTextoWhatsApp(): string {
    const ref = this.cotacao.referencia || this.ultimaCotacaoRef || 'N/A';
    const data = this.formatarData(this.cotacao.data);
    const total = this.totalGeral.toFixed(2);
    
    let texto = `*COTAÇÃO ${ref}*\n\n`;
    texto += `Olá ${this.cotacao.clienteNome || 'Cliente'},\n\n`;
    texto += `Segue a cotação solicitada:\n\n`;
    texto += `*Referência:* ${ref}\n`;
    texto += `*Data:* ${data}\n`;
    texto += `*Rota:* ${this.cotacao.origem} → ${this.cotacao.destino}\n`;
    if (this.cotacao.tipoVeiculo) {
      texto += `*Tipo de Veículo:* ${this.cotacao.tipoVeiculo}\n`;
    }
    texto += `\n*Valor Total:* ${total} MZN\n\n`;
    if (this.cotacao.condicoes) {
      texto += `*Condições:*\n${this.cotacao.condicoes}\n\n`;
    }
    texto += `Agradecemos a preferência!\n\nVM Transportes - Lirandzo`;

    return texto;
  }

  fecharPreview(): void {
    this.showPreview = false;
  }

  guardarPDF(): void {
    // Obter o elemento HTML do preview
    const element = document.getElementById('cotacao-preview-content');
    if (!element) {
      this.mostrarNotificacao('Erro ao gerar PDF: conteúdo não encontrado.', 'error');
      return;
    }

    // Configurações para o PDF
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Cotacao_${this.cotacao.referencia || 'Nova'}.pdf`,
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

    // Gerar e guardar o PDF
    html2pdf().set(opt).from(element).save().then(() => {
      this.mostrarNotificacao('PDF gerado e guardado com sucesso!', 'success');
      this.fecharPreview();
    }).catch((error: unknown) => {
      console.error('Erro ao gerar PDF:', error);
      this.mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
    });
  }

  private criarOuBuscarCliente(): Promise<number> {
    return new Promise((resolve, reject) => {
      const nome = this.cotacao.clienteNome?.trim();
      const telefone = this.cotacao.clienteTelefone?.trim();

      if (nome || telefone) {
        this.clienteService.buscarClientes(nome, telefone).subscribe({
          next: (clientes: Cliente[]) => {
            if (clientes && clientes.length > 0) {
              const clienteEncontrado = clientes.find((c: Cliente) =>
                c.nome?.toLowerCase() === nome?.toLowerCase() ||
                c.telefone === telefone
              ) || clientes[0];

              if (clienteEncontrado.id) {
                resolve(clienteEncontrado.id);
              } else {
                this.criarNovoCliente().then(resolve).catch(reject);
              }
            } else {
              this.criarNovoCliente().then(resolve).catch(reject);
            }
          },
          error: (error: unknown) => {
            console.error('Erro ao buscar cliente:', error);
            this.criarNovoCliente().then(resolve).catch(reject);
          }
        });
      } else {
        this.criarNovoCliente().then(resolve).catch(reject);
      }
    });
  }

  private criarNovoCliente(): Promise<number> {
    return new Promise((resolve, reject) => {
      const clienteData = {
        nome: this.cotacao.clienteNome,
        telefone: this.cotacao.clienteTelefone || '',
        email: this.cotacao.clienteEmail || '',
        endereco: this.cotacao.origem || '',
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

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    console.log('mostrarNotificacao chamado:', message, type);
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto-fechar após 7 segundos
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
}
