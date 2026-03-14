import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';
import { ClienteService } from '../../../services/cliente.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

interface ItemEncomenda {
  quantidade: number;
  descricao: string;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-encomendas-editar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './encomendas-editar.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-cadastro.component.css']
})
export class EncomendasEditarComponent implements OnInit {
  encomenda = {
    numeroFactura: '',
    data: '',
    clienteNome: '',
    clienteEndereco: '',
    clienteProvincia: '',
    clienteContacto: '',
    clienteTelefone: '',
    clienteNuit: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    termos: '',
    observacoes: ''
  };

  itens: ItemEncomenda[] = [
    { quantidade: 1, descricao: '', precoUnitario: null }
  ];

  provincias = ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];

  // Popup de notificação
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  clienteId: number | null = null;
  encomendaId: number | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encomendaService: EncomendaService,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.encomendaId = +id;
      this.carregarEncomenda();
    } else {
      this.loading = false;
      this.mostrarNotificacao('ID da encomenda não fornecido', 'error');
    }
  }

  carregarEncomenda() {
    if (!this.encomendaId) {
      this.error = 'ID da encomenda não fornecido';
      this.loading = false;
      this.mostrarNotificacao('ID da encomenda não fornecido', 'error');
      return;
    }

    this.loading = true;
    this.error = null;
    this.encomendaService.obterEncomenda(this.encomendaId).subscribe({
      next: (encomendaApi: EncomendaResponse) => {
        try {
          console.log('Encomenda carregada:', encomendaApi);
          
          // Preencher formulário com dados existentes
          this.encomenda.clienteNome = encomendaApi.cliente?.nome || '';
          this.encomenda.clienteTelefone = encomendaApi.cliente?.telefone || '';
          this.encomenda.clienteNuit = encomendaApi.cliente?.nif || '';
          
          // Separar endereço em endereço e província
          const enderecoCompleto = encomendaApi.cliente?.endereco || '';
          if (enderecoCompleto) {
            const partes = enderecoCompleto.split(',');
            this.encomenda.clienteEndereco = partes[0]?.trim() || '';
            this.encomenda.clienteProvincia = partes.length > 1 ? partes[1]?.trim() : '';
          } else {
            this.encomenda.clienteEndereco = '';
            this.encomenda.clienteProvincia = '';
          }

          // Formatar data
          if (encomendaApi.dataEncomenda) {
            try {
              const dataObj = new Date(encomendaApi.dataEncomenda);
              if (!isNaN(dataObj.getTime())) {
                this.encomenda.data = dataObj.toISOString().split('T')[0];
              } else {
                this.encomenda.data = '';
              }
            } catch (e) {
              console.warn('Erro ao formatar data:', e);
              this.encomenda.data = '';
            }
          } else {
            this.encomenda.data = '';
          }
          
          // Produto como item único
          this.itens = [{
            quantidade: 1,
            descricao: encomendaApi.produto || '',
            precoUnitario: encomendaApi.valorTotal || null
          }];

          // Preencher custos se disponíveis (pode não estar na API, mas tentamos)
          // Estes campos podem não existir na resposta, então mantemos null

          this.clienteId = encomendaApi.cliente?.id || null;
          this.loading = false;
        } catch (error) {
          console.error('Erro ao processar dados da encomenda:', error);
          this.loading = false;
          this.error = 'Erro ao processar dados da encomenda';
          this.mostrarNotificacao('Erro ao processar dados da encomenda', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar encomenda:', error);
        console.error('Detalhes do erro:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.loading = false;
        const mensagemErro = error.status === 404 
          ? 'Encomenda não encontrada' 
          : error.status === 0
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
          : `Erro ao carregar encomenda: ${error.statusText || error.message}`;
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

  adicionarItem() {
    this.itens.push({ quantidade: 1, descricao: '', precoUnitario: null });
  }

  removerItem(index: number) {
    if (this.itens.length > 1) {
      this.itens.splice(index, 1);
    }
  }

  getBackLink(): string {
    return this.encomendaId ? `/billing/encomendas/${this.encomendaId}` : '/billing/encomendas';
  }

  getSubtotalItem(item: ItemEncomenda): number {
    return item.quantidade * (item.precoUnitario || 0);
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return (this.encomenda.custoTransporte || 0) + (this.encomenda.custoRecolha || 0) + (this.encomenda.custoBillOfEntry || 0);
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  salvar() {
    // Validações básicas
    if (!this.encomenda.clienteNome || !this.encomenda.clienteEndereco) {
      this.mostrarNotificacao('Factura não guardada', 'error');
      return;
    }

    if (this.totalGeral <= 0) {
      this.mostrarNotificacao('Factura não guardada', 'error');
      return;
    }

    // Criar ou buscar cliente
    this.criarOuBuscarCliente().then(clienteId => {
      if (!clienteId) {
        this.mostrarNotificacao('Factura não guardada', 'error');
        return;
      }

      // Preparar produto (juntar todos os itens)
      const produto = this.itens.map(item => 
        `${item.quantidade}x ${item.descricao}`
      ).join(', ');

      // Preparar dados para atualização
      const encomendaData = {
        cliente: { id: clienteId },
        produto: produto,
        origem: this.encomenda.clienteProvincia || 'Maputo',
        destino: this.encomenda.clienteProvincia || 'Maputo',
        valorTotal: this.totalGeral,
        dataEncomenda: this.encomenda.data || new Date().toISOString().split('T')[0]
      };

      // Atualizar encomenda
      if (!this.encomendaId) {
        this.mostrarNotificacao('Factura não guardada', 'error');
        return;
      }

      this.encomendaService.atualizarEncomenda(this.encomendaId, encomendaData).subscribe({
        next: () => {
          this.mostrarNotificacao('Factura guardada', 'success');
          setTimeout(() => {
            this.router.navigate(['/billing/encomendas', this.encomendaId]);
          }, 1500);
        },
        error: (error) => {
          console.error('Erro ao atualizar factura:', error);
          this.mostrarNotificacao('Factura não guardada', 'error');
        }
      });
    }).catch(error => {
      console.error('Erro ao criar/buscar cliente:', error);
      this.mostrarNotificacao('Factura não guardada', 'error');
    });
  }

  private criarOuBuscarCliente(): Promise<number> {
    return new Promise((resolve, reject) => {
      const nome = this.encomenda.clienteNome?.trim();
      const telefone = this.encomenda.clienteTelefone?.trim();

      if (nome || telefone) {
        this.clienteService.buscarClientes(nome, telefone).subscribe({
          next: (clientes) => {
            if (clientes && clientes.length > 0) {
              const clienteEncontrado = clientes.find(c => 
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
          error: (error) => {
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
        nome: this.encomenda.clienteNome,
        telefone: this.encomenda.clienteTelefone || '',
        email: '',
        endereco: `${this.encomenda.clienteEndereco || ''}${this.encomenda.clienteProvincia ? ', ' + this.encomenda.clienteProvincia : ''}`.trim(),
        nif: this.encomenda.clienteNuit || ''
      };

      this.clienteService.criarCliente(clienteData).subscribe({
        next: (cliente) => {
          if (cliente.id) {
            resolve(cliente.id);
          } else {
            reject(new Error('Cliente criado mas sem ID'));
          }
        },
        error: (error) => {
          console.error('Erro ao criar cliente:', error);
          reject(error);
        }
      });
    });
  }
}
