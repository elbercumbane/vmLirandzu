import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
export class CotacoesCadastroComponent {

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

  private ultimaCotacaoId: number | null = null;

  constructor(
    private cotacaoService: CotacaoService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

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
    if (!this.cotacao.clienteNome || !this.cotacao.origem || !this.cotacao.destino || this.totalGeral <= 0) {
      this.mostrarNotificacao('Por favor, preencha os dados do cliente, rota e itens com valores válidos.', 'error');
      return;
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

      this.cotacaoService.criarCotacao(payload).subscribe({
        next: (res: CotacaoResponse) => {
          this.ultimaCotacaoId = res.id;
          this.cotacao.referencia = res.referencia;
          this.mostrarNotificacao('Cotação guardada com sucesso', 'success');
        },
        error: (error: unknown) => {
          console.error('Erro ao guardar cotação:', error);
          this.mostrarNotificacao('Cotação não guardada', 'error');
        }
      });
    }).catch(error => {
      console.error('Erro ao criar/buscar cliente:', error);
      this.mostrarNotificacao('Cotação não guardada', 'error');
    });
  }

  gerarCotacaoPDF(): void {
    // Verificar se a cotação foi guardada
    if (!this.cotacao.referencia) {
      this.mostrarNotificacao('Por favor, guarde a cotação primeiro antes de gerar o PDF.', 'error');
      return;
    }

    // Mostrar preview
    this.showPreview = true;
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
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
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
