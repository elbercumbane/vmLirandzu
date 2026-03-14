import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService } from '../../../services/encomenda.service';
import { ClienteService } from '../../../services/cliente.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

interface ItemEncomenda {
  quantidade: number;
  descricao: string;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-encomendas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './encomendas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-cadastro.component.css']
})
export class EncomendasCadastroComponent {
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

  constructor(
    private encomendaService: EncomendaService,
    private clienteService: ClienteService
  ) {}

  adicionarItem(): void {
    this.itens.push({ quantidade: 1, descricao: '', precoUnitario: null });
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) this.itens.splice(index, 1);
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

  salvar(): void {
    // Validar campos obrigatórios
    if (!this.encomenda.clienteNome || !this.encomenda.clienteEndereco || this.totalGeral <= 0) {
      this.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios e adicione itens.', 'error');
      return;
    }

    // Primeiro, criar ou buscar cliente
    this.criarOuBuscarCliente().then(clienteId => {
      if (!clienteId) {
        this.mostrarNotificacao('Factura não guardada', 'error');
        return;
      }

      // Preparar dados da encomenda
      const produto = this.itens.map(item => 
        `${item.quantidade}x ${item.descricao || 'Item'}`
      ).join(', ') || 'Encomenda';

      const origem = this.encomenda.clienteEndereco;
      const destino = this.encomenda.clienteProvincia || this.encomenda.clienteEndereco;

      const encomendaData = {
        cliente: { id: clienteId },
        produto: produto,
        origem: origem,
        destino: destino,
        valorTotal: this.totalGeral,
        valorPago: 0,
        dataEncomenda: this.encomenda.data || new Date().toISOString().split('T')[0]
      };

      // Criar encomenda
      this.encomendaService.criarEncomenda(encomendaData).subscribe({
        next: (response) => {
          this.mostrarNotificacao('Factura guardada', 'success');
          // Limpar formulário após sucesso
          setTimeout(() => {
            this.resetForm();
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao guardar factura:', error);
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
      // Primeiro, tentar buscar cliente existente por nome ou telefone
      const nome = this.encomenda.clienteNome?.trim();
      const telefone = this.encomenda.clienteTelefone?.trim();

      if (nome || telefone) {
        this.clienteService.buscarClientes(nome, telefone).subscribe({
          next: (clientes) => {
            if (clientes && clientes.length > 0) {
              // Encontrar cliente que corresponde melhor (por nome exato ou telefone)
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
            // Se falhar a busca, criar novo cliente
            this.criarNovoCliente().then(resolve).catch(reject);
          }
        });
      } else {
        // Se não houver critério de busca, criar novo cliente
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

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  private resetForm(): void {
    this.encomenda = {
      numeroFactura: '',
      data: '',
      clienteNome: '',
      clienteEndereco: '',
      clienteProvincia: '',
      clienteContacto: '',
      clienteTelefone: '',
      clienteNuit: '',
      custoTransporte: null,
      custoRecolha: null,
      custoBillOfEntry: null,
      termos: '',
      observacoes: ''
    };
    this.itens = [{ quantidade: 1, descricao: '', precoUnitario: null }];
  }
}
