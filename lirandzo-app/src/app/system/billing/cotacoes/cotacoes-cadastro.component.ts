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
  unidade: 'kg' | 'toneladas' | '';
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

  private readonly STATUS_PENDENTE_BACKEND = 'PENDING';
  private readonly STATUS_COTACAO_GERADA_BACKEND = 'QUOTATION_GENERATED';
  private readonly VALIDIDADE_DIAS = 3;

  cotacao = {
    referencia: '',
    data: new Date().toISOString().split('T')[0],
    validade: '',
    operador: '',
    clienteNome: '',
    clienteTelefone: '',
    clienteEmail: '',
    origem: '',
    destino: '',
    tipoVeiculo: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    // Nesta tela, "observacoes" será usado como "Origem" automática (PORTAL / MANUAL)
    observacoes: 'MANUAL',
    formaEnvioPreferida: 'whatsapp' as string
  };

  itens: ItemCotacao[] = [
    { descricao: '', quantidade: 1, unidade: '', precoUnitario: null }
  ];

  operadores = ['Ana Silva', 'João Macuácua', 'Alberto Chissano', 'Mário Tembe'];
  tiposVeiculo = ['Camião Pesado (+16t)', 'Camião Médio (7.5-16t)', 'Camião Leve (até 7.5t)', 'Semi-Reboque'];

  // Notificação
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  // Preview modal
  showPreview: boolean = false;
  modoPdfOnly: boolean = false;
  modoConfirmacaoGeracao: boolean = false;
  completionOpen: boolean = false;
  completionMessage: string = '';

  ultimaCotacaoId: number | null = null;
  private ultimaCotacaoRef: string = '';
  private clienteIdAtual: number | null = null;
  modoPortal: boolean = false;

  constructor(
    private cotacaoService: CotacaoService,
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  voltarParaEnviadas(): void {
    this.router.navigate(['/billing/cotacoes/enviadas']);
  }

  ngOnInit() {
    // Modo manual: data = hoje e validade = +3 dias (os inputs serão bloqueados)
    this.cotacao.validade = this.calcularValidadeISO(this.cotacao.data);
    this.cotacao.observacoes = 'MANUAL';

    this.route.queryParams.subscribe(params => {
      this.modoPdfOnly = params['pdfOnly'] === '1';
    });

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
        this.modoPortal = (cotacao.fontePedido || '').toUpperCase() === 'PORTAL';

        // Preencher automaticamente os dados do pedido
        if (cotacao.cliente) {
          this.cotacao.clienteNome = cotacao.cliente.nome || '';
          this.cotacao.clienteTelefone = cotacao.cliente.telefone || '';
          this.cotacao.clienteEmail = cotacao.cliente.email || '';
          this.clienteIdAtual = cotacao.cliente.id || null;
        }
        
        // Preencher origem e destino
        this.cotacao.origem = cotacao.origem || '';
        this.cotacao.destino = cotacao.destino || '';

        // Data da cotação vem do portal (não deve ser alterada pelo utilizador)
        if (cotacao.dataCotacao) {
          this.cotacao.data = this.normalizarISODate(cotacao.dataCotacao);
          this.cotacao.validade = this.calcularValidadeISO(this.cotacao.data);
        }
        
        // Preencher tipo de veículo se existir
        if (cotacao.tipoVeiculo) {
          this.cotacao.tipoVeiculo = cotacao.tipoVeiculo;
        }
        
        // Preencher descrição da carga (mensagem do pedido) — parsear quantidades e unidades
        if (cotacao.descricaoCarga) {
          this.itens = this.parseDescricaoCarga(cotacao.descricaoCarga);
          if (this.itens.length === 0) {
            this.itens = [{ descricao: cotacao.descricaoCarga, quantidade: 1, unidade: '', precoUnitario: null }];
          }
        }
        
        // Origem automática: PORTAL ou MANUAL
        const fonte = (cotacao.fontePedido || '').toUpperCase();
        if (fonte === 'PORTAL') {
          this.cotacao.observacoes = 'PORTAL';
        } else {
          // fallback: se veio como pedido do portal, o backend pode ter vindo com texto em "observacoes"
          const textoObserv = (cotacao.observacoes || '').toLowerCase();
          this.cotacao.observacoes = textoObserv.includes('portal') ? 'PORTAL' : 'MANUAL';
        }

        // Preferência de envio deve vir do portal (para alimentar a coluna na lista)
        this.cotacao.formaEnvioPreferida = (cotacao.formaEnvioPreferida || cotacao.formaEnvioRealizada || this.cotacao.formaEnvioPreferida || 'whatsapp');
        
        // Guardar o ID da cotação para atualização posterior
        this.ultimaCotacaoId = cotacao.id;
        this.cotacao.referencia = cotacao.referencia || '';
        this.ultimaCotacaoRef = cotacao.referencia || '';
        
        this.mostrarNotificacao('Dados do pedido carregados automaticamente', 'success');

        // Se veio pelo botão "PDF" da lista, gerar automaticamente e voltar para "enviadas"
        if (this.modoPdfOnly) {
          setTimeout(() => {
            // No modo "ver PDF", abrimos o preview para o operador poder confirmar visualmente.
            this.showPreview = true;
          }, 500);
        }
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar dados do pedido:', error);
        this.mostrarNotificacao('Erro ao carregar dados do pedido. Pode preencher manualmente.', 'error');
      }
    });
  }

  adicionarItem(): void {
    this.itens.push({ descricao: '', quantidade: 1, unidade: '', precoUnitario: null });
  }

  /**
   * Parseia o texto da descrição da carga e extrai quantidades e unidades.
   * Reconhece: 500kg, 500 kilos, 100 toneladas, 3 toneldas (typo), kg porco (unidade primeiro), etc.
   * Quando não reconhece, define quantidade 1 para permitir edição manual.
   */
  private parseDescricaoCarga(texto: string): ItemCotacao[] {
    const itens: ItemCotacao[] = [];
    const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    // Padrão 1: número + unidade + descrição (ex: 50 kg porco, 3 toneldas de ferramentas)
    const numUnidadeRegex = /^([\d.,]+)\s*(kgs?|kilos?|quilos?|toneladas?|toneldas?|tonneladas?|t)\b\s*(?:de\s+)?(.*)$/i;
    // Padrão 2: unidade + descrição sem número (ex: kg porco, toneladas feijao)
    const unidadeDescricaoRegex = /^(kgs?|kilos?|quilos?|toneladas?|toneldas?|tonneladas?|t)\b\s+(.+)$/i;

    const normalizarUnidade = (raw: string): 'kg' | 'toneladas' | '' => {
      const r = raw.toLowerCase();
      if (/^(kg|kgs|kilo|kilos|quilo|quilos)$/.test(r)) return 'kg';
      if (/^(tonelada|toneladas|toneldas?|tonneladas?|t)$/.test(r)) return 'toneladas';
      return '';
    };

    for (const linha of linhas) {
      const limpa = linha.replace(/^\s*\d+[.)]\s*/, '').trim();
      const matchNum = limpa.match(numUnidadeRegex);
      const matchUnidade = limpa.match(unidadeDescricaoRegex);

      if (matchNum) {
        const numStr = (matchNum[1] || '').replace(',', '.');
        const quantidade = parseFloat(numStr) || 1;
        const unidade = normalizarUnidade(matchNum[2] || '');
        const descResto = (matchNum[3] || '').trim();
        itens.push({
          descricao: descResto || limpa,
          quantidade: Math.round(quantidade) === quantidade ? quantidade : Math.round(quantidade * 100) / 100,
          unidade,
          precoUnitario: null
        });
      } else if (matchUnidade) {
        const unidade = normalizarUnidade(matchUnidade[1] || '');
        const descResto = (matchUnidade[2] || '').trim();
        itens.push({
          descricao: descResto || limpa,
          quantidade: 1,
          unidade,
          precoUnitario: null
        });
      } else {
        itens.push({ descricao: limpa || linha, quantidade: 1, unidade: '', precoUnitario: null });
      }
    }
    return itens;
  }

  removerItem(i: number): void {
    if (this.itens.length > 1) this.itens.splice(i, 1);
  }

  getSubtotalItem(item: ItemCotacao): number {
    // Por agora, o subtotal é definido manualmente pelo utilizador,
    // igual ao valor em MZN (preço unitário) introduzido no campo.
    return item.precoUnitario ?? 0;
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    // Nesta fase, só existe "Recolha" como custo adicional
    return (this.cotacao.custoRecolha || 0);
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  /**
   * Gera uma cotação e envia o utilizador para a página de "Cotações Enviadas".
   * Marca a cotação com status COTACAO_GERADA para aparecer na lista.
   */
  gerarCotacao(): void {
    if (!this.cotacao.clienteNome || !this.cotacao.origem || !this.cotacao.destino) {
      this.mostrarNotificacao('Por favor, preencha os dados do cliente e rota (origem e destino).', 'error');
      return;
    }
    
    this.modoConfirmacaoGeracao = true;

    const obterClienteId = (): Promise<number> => {
      if (this.clienteIdAtual) return Promise.resolve(this.clienteIdAtual);
      return this.criarOuBuscarCliente();
    };

    obterClienteId().then(clienteId => {
      if (!clienteId) {
        this.mostrarNotificacao('Cotação não guardada', 'error');
        return;
      }

      const descricaoCarga = this.itens
        .filter(i => i.descricao?.trim())
        .map(i => {
          const qtd = i.quantidade || 1;
          const un = i.unidade ? ` ${i.unidade}` : '';
          return `${qtd}${un} ${i.descricao}`.trim();
        })
        .join(', ');

      const payload: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: this.STATUS_PENDENTE_BACKEND,
        observacoes: this.cotacao.observacoes || undefined,
        formaEnvioPreferida: this.cotacao.formaEnvioPreferida || undefined,
        operador: this.cotacao.operador || undefined
      };

      const handleSuccess = (res: CotacaoResponse) => {
        this.ultimaCotacaoId = res.id;
        this.cotacao.referencia = res.referencia || '';
        this.ultimaCotacaoRef = res.referencia || '';

        // Abrir popup de confirmação com preview da cotação.
        this.showPreview = true;
      };

      if (this.ultimaCotacaoId) {
        this.cotacaoService.atualizarCotacao(this.ultimaCotacaoId, payload).subscribe({
          next: handleSuccess,
          error: (error: unknown) => {
            console.error('Erro ao atualizar cotação:', error);
            this.mostrarNotificacao('Cotação não guardada', 'error');
          }
        });
      } else {
        this.cotacaoService.criarCotacao(payload).subscribe({
          next: handleSuccess,
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

  /**
   * Finaliza a geração:
   *  - atualiza status para QUOTATION_GENERATED
   *  - baixa o PDF automaticamente
   *  - redireciona para Cotações Enviadas
   */
  async finalizarGeracao(): Promise<void> {
    if (!this.ultimaCotacaoId) {
      this.mostrarNotificacao('Cotação não guardada', 'error');
      return;
    }

    const obterClienteId = (): Promise<number> => {
      if (this.clienteIdAtual) return Promise.resolve(this.clienteIdAtual);
      return this.criarOuBuscarCliente();
    };

    try {
      const clienteId = await obterClienteId();
      if (!clienteId) {
        this.mostrarNotificacao('Cotação não guardada', 'error');
        return;
      }

      const descricaoCarga = this.itens
        .filter(i => i.descricao?.trim())
        .map(i => {
          const qtd = i.quantidade || 1;
          const un = i.unidade ? ` ${i.unidade}` : '';
          return `${qtd}${un} ${i.descricao}`.trim();
        })
        .join(', ');

      const payloadFinal: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: this.STATUS_COTACAO_GERADA_BACKEND,
        observacoes: this.cotacao.observacoes || undefined,
        formaEnvioPreferida: this.cotacao.formaEnvioPreferida || undefined,
        operador: this.cotacao.operador || undefined
      };

      await new Promise<void>((resolve, reject) => {
        this.cotacaoService.atualizarCotacao(this.ultimaCotacaoId as number, payloadFinal).subscribe({
          next: (res: CotacaoResponse) => {
            this.cotacao.referencia = res.referencia || '';
            this.ultimaCotacaoRef = res.referencia || '';
            resolve();
          },
          error: (error: unknown) => {
            console.error('Erro ao finalizar cotação:', error);
            reject(error);
          }
        });
      });

      // Baixar PDF e fechar popup.
      await this.guardarPDF(true);

      // Popup final para concluir.
      this.completionMessage = 'Finalizado com sucesso!';
      this.completionOpen = true;
    } catch (e) {
      this.mostrarNotificacao('Erro ao finalizar a cotação', 'error');
    }
  }

  concludeCompletion(): void {
    this.completionOpen = false;
    this.router.navigate(['/billing/cotacoes/enviadas']);
  }

  private async gerarPdfAutoAoCarregarPedido(): Promise<void> {
    // Esperar preview renderizar antes de gerar PDF
    this.showPreview = true;
    setTimeout(async () => {
      await this.guardarPDF(true);
      this.router.navigate(['/billing/cotacoes/enviadas']);
    }, 600);
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
        .map(i => {
          const qtd = i.quantidade || 1;
          const un = i.unidade ? ` ${i.unidade}` : '';
          return `${qtd}${un} ${i.descricao}`.trim();
        })
        .join(', ');

      const payload: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral || undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: this.STATUS_PENDENTE_BACKEND,
        observacoes: this.cotacao.observacoes || undefined,
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

  /**
   * Confirma o envio da cotação: guarda se necessário, marca como enviada e redireciona para Cotações Enviadas.
   */
  confirmarEnvio(): void {
    if (!this.cotacao.clienteNome || !this.cotacao.origem || !this.cotacao.destino) {
      this.mostrarNotificacao('Por favor, preencha os dados do cliente e rota antes de confirmar o envio.', 'error');
      return;
    }

    const prosseguirMarcar = () => {
      this.marcarComoEnviada('manual', 'Cotação marcada como enviada com sucesso!');
    };

    if (!this.ultimaCotacaoId) {
      this.criarOuBuscarCliente().then(clienteId => {
        if (!clienteId) {
          this.mostrarNotificacao('Erro ao obter dados do cliente.', 'error');
          return;
        }

        const descricaoCarga = this.itens
          .filter(i => i.descricao?.trim())
          .map(i => {
            const qtd = i.quantidade || 1;
            const un = i.unidade ? ` ${i.unidade}` : '';
            return `${qtd}${un} ${i.descricao}`.trim();
          })
          .join(', ');

        const payload: CotacaoRequest = {
          cliente: { id: clienteId },
          origem: this.cotacao.origem,
          destino: this.cotacao.destino,
          tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
          descricaoCarga: descricaoCarga || undefined,
          valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
          custoRecolha: this.cotacao.custoRecolha || undefined,
          dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
          dataValidade: this.cotacao.validade || undefined,
          status: this.STATUS_PENDENTE_BACKEND,
          observacoes: this.cotacao.observacoes || undefined,
          operador: this.cotacao.operador || undefined
        };

        this.cotacaoService.criarCotacao(payload).subscribe({
          next: (res: CotacaoResponse) => {
            this.ultimaCotacaoId = res.id;
            this.cotacao.referencia = res.referencia || '';
            this.ultimaCotacaoRef = res.referencia || '';
            prosseguirMarcar();
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

    prosseguirMarcar();
  }

  private marcarComoEnviada(formaEnvio: 'whatsapp' | 'pdf' | 'chamada' | 'manual', mensagemSucesso?: string): void {
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
        .map(i => {
          const qtd = i.quantidade || 1;
          const un = i.unidade ? ` ${i.unidade}` : '';
          return `${qtd}${un} ${i.descricao}`.trim();
        })
        .join(', ');

      const atualizacao: CotacaoRequest = {
        cliente: { id: clienteId },
        origem: this.cotacao.origem,
        destino: this.cotacao.destino,
        tipoVeiculo: this.cotacao.tipoVeiculo || undefined,
        descricaoCarga: descricaoCarga || undefined,
        valorTotal: this.totalGeral > 0 ? this.totalGeral : undefined,
        custoRecolha: this.cotacao.custoRecolha || undefined,
        dataCotacao: this.cotacao.data || new Date().toISOString().split('T')[0],
        dataValidade: this.cotacao.validade || undefined,
        status: this.STATUS_COTACAO_GERADA_BACKEND,
        observacoes: this.cotacao.observacoes || undefined,
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
    texto += `\n*Valor Total:* ${total} MZN\n\n`;
    texto += `Agradecemos a preferência!\n\nVM Transportes - Lirandzo`;

    return texto;
  }

  getFormaEnvioLabel(preferida?: string | null): string {
    const m: Record<string, string> = {
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      chamada: 'Chamada'
    };
    const key = (preferida || '').toLowerCase();
    return m[key] || preferida || 'N/A';
  }

  /**
   * Nome do ficheiro/identificador do PDF no formato:
   * ct00_carlosmaria_2026
   */
  getQuotationDocumentName(): string {
    const ref = (this.cotacao.referencia || this.ultimaCotacaoRef || '').toString();
    const year = this.cotacao.data ? this.cotacao.data.substring(0, 4) : String(new Date().getFullYear());
    const clientSlug = this.slugifyClientName(this.cotacao.clienteNome || 'client');
    const quoteIndexCode = this.extractQuoteIndexCode(ref);
    return `ct${quoteIndexCode}_${clientSlug}_${year}`;
  }

  private slugifyClientName(name: string): string {
    const normalized = (name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const alnum = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return alnum || 'client';
  }

  /**
   * Extrai um código de 2 dígitos da referência.
   * Ex: "COT-2026-0005" -> "00"
   */
  private extractQuoteIndexCode(ref: string): string {
    const match = ref.match(/\d{4}-(\d{4,})/);
    if (match && match[1]) return match[1].slice(0, 2).padStart(2, '0');

    const allDigits = ref.match(/\d+/g);
    if (!allDigits || allDigits.length === 0) return '00';

    const quoteYear = this.cotacao.data ? this.cotacao.data.substring(0, 4) : undefined;
    const last = allDigits[allDigits.length - 1];

    // Caso a referência venha como "A/003/2026" (último grupo = ano),
    // o índice fica no grupo anterior (ex: "003" -> "00").
    if (quoteYear && last === quoteYear && allDigits.length >= 2) {
      const beforeLast = allDigits[allDigits.length - 2];
      return beforeLast.slice(0, 2).padStart(2, '0');
    }

    return last.slice(0, 2).padStart(2, '0');
  }

  fecharPreview(): void {
    this.showPreview = false;
    this.modoConfirmacaoGeracao = false;
  }

  async guardarPDF(silent: boolean = false): Promise<void> {
    // Obter o elemento HTML do preview
    const element = document.getElementById('cotacao-preview-content');
    if (!element) {
      this.mostrarNotificacao('Erro ao gerar PDF: conteúdo não encontrado.', 'error');
      return;
    }

    // Configurações para o PDF
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${this.getQuotationDocumentName()}.pdf`,
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

    try {
      // Gerar e guardar o PDF
      await html2pdf().set(opt).from(element).save();
      if (!silent) {
        this.mostrarNotificacao('PDF gerado e guardado com sucesso!', 'success');
      }
      this.fecharPreview();

      // Quando o operador veio apenas para ver/baixar o PDF,
      // após gerar o ficheiro regressamos à lista.
      if (this.modoPdfOnly) {
        setTimeout(() => {
          this.router.navigate(['/billing/cotacoes/enviadas']);
        }, 300);
      }
    } catch (error: unknown) {
      console.error('Erro ao gerar PDF:', error);
      this.mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
    }
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
      // Se for "YYYY-MM-DD", evitar timezone do construtor Date()
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const localDate = this.parseISODateToLocal(data);
        if (localDate) {
          return localDate.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      }

      const date = new Date(data);
      return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return data;
    }
  }

  private normalizarISODate(dateISO: string): string {
    // Esperamos algo como "YYYY-MM-DD" vindo do backend.
    // Mantemos os primeiros 10 chars para evitar timezones etc.
    return (dateISO || '').slice(0, 10);
  }

  private calcularValidadeISO(dataISO: string): string {
    const base = this.parseISODateToLocal(dataISO);
    if (!base) return '';
    base.setDate(base.getDate() + this.VALIDIDADE_DIAS);
    return this.toISODate(base);
  }

  private parseISODateToLocal(iso: string): Date | null {
    if (!iso) return null;
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!y || !mo || !d) return null;
    return new Date(y, mo - 1, d);
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
