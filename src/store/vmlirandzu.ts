// Store central VM Lirandzu — estado + regras de negócio + persistência localStorage
// Implementado como módulo TypeScript standalone (sem dependências externas),
// pronto para ser utilizado por qualquer camada de UI (Angular, React, etc.).

// TIPOS BÁSICOS
export type StatusPagamento = 'NAO_PAGO' | 'PARCIAL' | 'PAGO' | 'CANCELADO';
export type StatusEncomenda =
  | 'RASCUNHO'
  | 'CONFIRMADA'
  | 'EM_VIAGEM'
  | 'CHEGOU_DEPOSITO'
  | 'ENTREGUE'
  | 'CANCELADA';
export type StatusViagem = 'PLANEADA' | 'EM_CURSO' | 'CONCLUIDA' | 'CANCELADA';
export type FormaPagamento = 'DINHEIRO' | 'MPESA' | 'EMOLA' | 'TRANSFERENCIA';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  lojaJHB: string;
  linkProduto?: string;
  quantidade: number;
  valorZAR: number;
}

export interface Pagamento {
  id: string;
  data: string;
  valor: number;
  forma: FormaPagamento;
  referencia?: string;
  registadoPor: string;
}

export interface Encomenda {
  id: string; // VML-2025-0001
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  produtos: Produto[];
  taxaTransporte: number;
  cambioZARMZN: number;
  valorTotalZAR: number;
  valorTotalMZN: number; // (ZAR * cambio) + taxaTransporte
  pagamentos: Pagamento[];
  valorPago: number;
  valorDivida: number;
  statusPagamento: StatusPagamento;
  statusEncomenda: StatusEncomenda;
  viagemId?: string;
  gestorId: string;
  dataCriacao: string;
  dataUltimaActualizacao: string;
  notasInternas?: string;
  // CAMPOS DE FLUXO
  confirmadaPorGestor: boolean;
  dataConfirmacao?: string;
  compradaNaLoja: boolean;
  dataCompra?: string;
  chegouDeposito: boolean;
  dataChegada?: string;
  entregueAoCliente: boolean;
  dataEntrega?: string;
  assinaturaEntrega?: string; // nome de quem levantou
}

export interface Viagem {
  id: string; // VGM-001
  gestorId: string;
  dataPartida: string;
  dataRetornoPrevisto: string;
  dataRetornoReal?: string;
  status: StatusViagem;
  encomendaIds: string[];
  // CAMPOS DE CONFERÊNCIA
  itensConferidos: Record<string, 'COMPRADO' | 'NAO_ENCONTRADO' | 'AGUARDA'>;
  totalZARViagem: number;
  totalMZNViagem: number;
  notasViagem?: string;
  autorizadaPorGestor: boolean;
  dataAutorizacao?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  encomendaIds: string[];
  totalGasto: number;
  totalDivida: number;
  dataCriacao: string;
}

export interface Gestor {
  id: string;
  nome: string;
  iniciais: string;
  cargo: string;
  pin: string;
  activo: boolean;
}

export interface AppState {
  encomendas: Encomenda[];
  viagens: Viagem[];
  clientes: Cliente[];
  gestores: Gestor[];
  cambioActual: number;
  taxaTransportePadrao: number;
  gestorLogado: Gestor | null;
  // ACTIONS — ENCOMENDAS
  criarEncomenda: (
    dados: Omit<
      Encomenda,
      | 'id'
      | 'dataCriacao'
      | 'dataUltimaActualizacao'
      | 'valorPago'
      | 'valorDivida'
      | 'statusPagamento'
      | 'pagamentos'
      | 'confirmadaPorGestor'
      | 'compradaNaLoja'
      | 'chegouDeposito'
      | 'entregueAoCliente'
    >
  ) => string;
  confirmarEncomenda: (id: string, gestorId: string) => void;
  cancelarEncomenda: (id: string, motivo: string) => void;
  registarPagamento: (
    encomendaId: string,
    pagamento: Omit<Pagamento, 'id'>
  ) => void;
  // ACTIONS — VIAGEM
  criarViagem: (
    dados: Omit<
      Viagem,
      'id' | 'itensConferidos' | 'totalZARViagem' | 'totalMZNViagem' | 'autorizadaPorGestor'
    >
  ) => string;
  adicionarEncomendaAViagem: (viagemId: string, encomendaId: string) => void;
  removerEncomendaDaViagem: (viagemId: string, encomendaId: string) => void;
  autorizarViagem: (viagemId: string, gestorId: string) => void;
  iniciarViagem: (viagemId: string) => void;
  conferirItemViagem: (
    viagemId: string,
    encomendaId: string,
    estado: 'COMPRADO' | 'NAO_ENCONTRADO' | 'AGUARDA'
  ) => void;
  concluirViagem: (viagemId: string, dataRetornoReal: string) => void;
  registarChegadaDeposito: (encomendaId: string) => void;
  registarEntregaCliente: (encomendaId: string, assinatura: string) => void;
  // ACTIONS — CLIENTES
  criarOuActualizarCliente: (
    dados: Omit<
      Cliente,
      'id' | 'encomendaIds' | 'totalGasto' | 'totalDivida' | 'dataCriacao'
    >
  ) => string;
  // GETTERS
  getEncomenda: (id: string) => Encomenda | undefined;
  getViagem: (id: string) => Viagem | undefined;
  getEncomendasViagem: (viagemId: string) => Encomenda[];
  getEncomendasCliente: (telefone: string) => Encomenda[];
  getDividasEmAberto: () => Encomenda[];
  getEncomendasAtrasadas: (diasLimite: number) => Encomenda[];
  getProximoIdEncomenda: () => string;
  getProximoIdViagem: () => string;
}

// --- Persistência ---

const PERSIST_KEY = 'vml-store';

interface SnapshotPersistido {
  encomendas: Encomenda[];
  viagens: Viagem[];
  clientes: Cliente[];
  gestores: Gestor[];
  cambioActual: number;
  taxaTransportePadrao: number;
  gestorLogadoId?: string | null;
}

const DEFAULT_CAMBIO = 3.8;
const DEFAULT_TAXA_TRANSPORTE = 1500;

const GESTORES_INICIAIS: Gestor[] = [
  {
    id: 'g1',
    nome: 'Ana Silva',
    iniciais: 'AS',
    cargo: 'Gestora Principal',
    pin: '1234',
    activo: true,
  },
  {
    id: 'g2',
    nome: 'Carlos Matos',
    iniciais: 'CM',
    cargo: 'Gestor de Viagens',
    pin: '2345',
    activo: true,
  },
  {
    id: 'g3',
    nome: 'Maria João',
    iniciais: 'MJ',
    cargo: 'Gestora Administrativa',
    pin: '3456',
    activo: true,
  },
];

function hasLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__vml_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadJSON<T>(key: string): T | null {
  if (!hasLocalStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveJSON(key: string, value: unknown): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignorar erros de quota
  }
}

// Instância única do estado
const store: AppState = {
  encomendas: [],
  viagens: [],
  clientes: [],
  gestores: [],
  cambioActual: DEFAULT_CAMBIO,
  taxaTransportePadrao: DEFAULT_TAXA_TRANSPORTE,
  gestorLogado: GESTORES_INICIAIS[0] ?? null,

  // --- ENCOMENDAS ---
  criarEncomenda: (dados): string => {
    const now = new Date();
    const id = store.getProximoIdEncomenda();

    const valorTotalZAR =
      dados.valorTotalZAR > 0
        ? dados.valorTotalZAR
        : dados.produtos.reduce(
            (acc, p) => acc + p.quantidade * p.valorZAR,
            0
          );

    const valorTotalMZN =
      valorTotalZAR * dados.cambioZARMZN + dados.taxaTransporte;

    const novaEncomenda: Encomenda = {
      ...dados,
      id,
      valorTotalZAR,
      valorTotalMZN,
      pagamentos: [],
      valorPago: 0,
      valorDivida: valorTotalMZN,
      statusPagamento: 'NAO_PAGO',
      statusEncomenda: 'RASCUNHO',
      confirmadaPorGestor: false,
      compradaNaLoja: false,
      chegouDeposito: false,
      entregueAoCliente: false,
      dataCriacao: now.toISOString(),
      dataUltimaActualizacao: now.toISOString(),
    };

    // Criar / actualizar cliente
    const clienteId = store.criarOuActualizarCliente({
      nome: dados.clienteNome,
      telefone: dados.clienteTelefone,
      email: dados.clienteEmail,
    });

    // Associar encomenda ao cliente
    const cliente = store.clientes.find((c) => c.id === clienteId);
    if (cliente && !cliente.encomendaIds.includes(id)) {
      cliente.encomendaIds.push(id);
    }

    store.encomendas = [...store.encomendas, novaEncomenda];
    persistirTudo();

    return id;
  },

  confirmarEncomenda: (id: string, gestorId: string): void => {
    const encomenda = store.encomendas.find((e) => e.id === id);
    if (!encomenda) return;
    const agora = new Date().toISOString();
    encomenda.statusEncomenda = 'CONFIRMADA';
    encomenda.confirmadaPorGestor = true;
    encomenda.dataConfirmacao = agora;
    encomenda.dataUltimaActualizacao = agora;
    encomenda.gestorId = gestorId;
    persistirTudo();
  },

  cancelarEncomenda: (id: string, motivo: string): void => {
    const encomenda = store.encomendas.find((e) => e.id === id);
    if (!encomenda) return;
    encomenda.statusEncomenda = 'CANCELADA';
    encomenda.notasInternas = [
      encomenda.notasInternas,
      `Cancelada: ${motivo}`,
    ]
      .filter(Boolean)
      .join(' | ');
    encomenda.dataUltimaActualizacao = new Date().toISOString();
    persistirTudo();
  },

  registarPagamento: (
    encomendaId: string,
    pagamento: Omit<Pagamento, 'id'>
  ): void => {
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!encomenda) return;

    const novoPagamento: Pagamento = {
      ...pagamento,
      id: `PAY-${encomenda.pagamentos.length + 1}`,
    };

    encomenda.pagamentos = [...encomenda.pagamentos, novoPagamento];
    encomenda.valorPago = encomenda.pagamentos.reduce(
      (acc, p) => acc + p.valor,
      0
    );
    encomenda.valorDivida = Math.max(
      0,
      encomenda.valorTotalMZN - encomenda.valorPago
    );

    if (encomenda.valorPago === 0) {
      encomenda.statusPagamento = 'NAO_PAGO';
    } else if (encomenda.valorPago > 0 && encomenda.valorPago < encomenda.valorTotalMZN) {
      encomenda.statusPagamento = 'PARCIAL';
    } else if (encomenda.valorPago >= encomenda.valorTotalMZN) {
      encomenda.statusPagamento = 'PAGO';
    }

    encomenda.dataUltimaActualizacao = new Date().toISOString();

    // Actualizar cliente
    const cliente = store.clientes.find(
      (c) => c.telefone === encomenda.clienteTelefone
    );
    if (cliente) {
      const encomendasCliente = store.encomendas.filter(
        (e) => e.clienteTelefone === cliente.telefone
      );
      cliente.totalGasto = encomendasCliente.reduce(
        (acc, e) => acc + e.valorPago,
        0
      );
      cliente.totalDivida = encomendasCliente.reduce(
        (acc, e) => acc + e.valorDivida,
        0
      );
    }

    persistirTudo();
  },

  // --- VIAGENS ---
  criarViagem: (dados): string => {
    const id = store.getProximoIdViagem();

    const totalZARViagem = dados.encomendaIds.reduce((acc, encId) => {
      const enc = store.encomendas.find((e) => e.id === encId);
      return acc + (enc ? enc.valorTotalZAR : 0);
    }, 0);

    const totalMZNViagem = dados.encomendaIds.reduce((acc, encId) => {
      const enc = store.encomendas.find((e) => e.id === encId);
      return acc + (enc ? enc.valorTotalMZN : 0);
    }, 0);

    const novaViagem: Viagem = {
      ...dados,
      id,
      itensConferidos: {},
      totalZARViagem,
      totalMZNViagem,
      autorizadaPorGestor: false,
    };

    store.viagens = [...store.viagens, novaViagem];

    // associar viagem às encomendas
    for (const encId of dados.encomendaIds) {
      const enc = store.encomendas.find((e) => e.id === encId);
      if (enc) {
        enc.viagemId = id;
        enc.dataUltimaActualizacao = new Date().toISOString();
      }
    }

    persistirTudo();
    return id;
  },

  adicionarEncomendaAViagem: (viagemId: string, encomendaId: string): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!viagem || !encomenda) return;
    if (!viagem.encomendaIds.includes(encomendaId)) {
      viagem.encomendaIds.push(encomendaId);
      encomenda.viagemId = viagemId;
      encomenda.dataUltimaActualizacao = new Date().toISOString();
    }

    viagem.totalZARViagem += encomenda.valorTotalZAR;
    viagem.totalMZNViagem += encomenda.valorTotalMZN;

    persistirTudo();
  },

  removerEncomendaDaViagem: (
    viagemId: string,
    encomendaId: string
  ): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!viagem || !encomenda) return;

    viagem.encomendaIds = viagem.encomendaIds.filter((id) => id !== encomendaId);
    delete viagem.itensConferidos[encomendaId];

    viagem.totalZARViagem -= encomenda.valorTotalZAR;
    viagem.totalMZNViagem -= encomenda.valorTotalMZN;

    encomenda.viagemId = undefined;
    encomenda.dataUltimaActualizacao = new Date().toISOString();

    persistirTudo();
  },

  autorizarViagem: (viagemId: string, gestorId: string): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    if (!viagem) return;

    if (!viagem.encomendaIds.length) {
      throw new Error('Viagem sem encomendas não pode ser autorizada');
    }

    const encomendas = viagem.encomendaIds
      .map((id) => store.encomendas.find((e) => e.id === id))
      .filter((e): e is Encomenda => !!e);

    const algumaNaoConfirmada = encomendas.some(
      (e) => e.statusEncomenda !== 'CONFIRMADA'
    );
    if (algumaNaoConfirmada) {
      throw new Error('Todas as encomendas devem estar CONFIRMADAS');
    }

    const encomendasNaoPagas = encomendas.filter(
      (e) => e.statusPagamento === 'NAO_PAGO'
    );
    if (encomendasNaoPagas.length) {
      // Não bloqueia, mas regista aviso nas notas internas
      for (const e of encomendasNaoPagas) {
        e.notasInternas = [
          e.notasInternas,
          'Aviso: Encomenda incluída em viagem sem qualquer pagamento.',
        ]
          .filter(Boolean)
          .join(' | ');
      }
    }

    viagem.autorizadaPorGestor = true;
    viagem.dataAutorizacao = new Date().toISOString();
    viagem.gestorId = gestorId;

    persistirTudo();
  },

  iniciarViagem: (viagemId: string): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    if (!viagem) return;
    if (!viagem.autorizadaPorGestor) {
      throw new Error('Viagem não autorizada');
    }

    viagem.status = 'EM_CURSO';

    const encomendas = viagem.encomendaIds
      .map((id) => store.encomendas.find((e) => e.id === id))
      .filter((e): e is Encomenda => !!e);

    for (const e of encomendas) {
      e.statusEncomenda = 'EM_VIAGEM';
      e.dataUltimaActualizacao = new Date().toISOString();
    }

    persistirTudo();
  },

  conferirItemViagem: (
    viagemId: string,
    encomendaId: string,
    estado: 'COMPRADO' | 'NAO_ENCONTRADO' | 'AGUARDA'
  ): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!viagem || !encomenda) return;

    viagem.itensConferidos[encomendaId] = estado;

    if (estado === 'COMPRADO') {
      encomenda.compradaNaLoja = true;
      encomenda.dataCompra = new Date().toISOString();
    }

    encomenda.dataUltimaActualizacao = new Date().toISOString();
    persistirTudo();
  },

  concluirViagem: (viagemId: string, dataRetornoReal: string): void => {
    const viagem = store.viagens.find((v) => v.id === viagemId);
    if (!viagem) return;

    const todasConferidas = viagem.encomendaIds.every(
      (id) => viagem.itensConferidos[id]
    );
    if (!todasConferidas) {
      throw new Error('Todos os itens devem ser conferidos antes de concluir');
    }

    viagem.status = 'CONCLUIDA';
    viagem.dataRetornoReal = dataRetornoReal;

    for (const encId of viagem.encomendaIds) {
      const encomenda = store.encomendas.find((e) => e.id === encId);
      if (!encomenda) continue;

      const estado = viagem.itensConferidos[encId];
      if (estado === 'COMPRADO') {
        encomenda.statusEncomenda = 'CHEGOU_DEPOSITO';
        encomenda.chegouDeposito = true;
        encomenda.dataChegada = dataRetornoReal;
      } else if (estado === 'NAO_ENCONTRADO') {
        encomenda.statusEncomenda = 'CANCELADA';
        encomenda.notasInternas = [
          encomenda.notasInternas,
          'Produto não encontrado em JHB',
        ]
          .filter(Boolean)
          .join(' | ');
      }
      encomenda.dataUltimaActualizacao = new Date().toISOString();
    }

    persistirTudo();
  },

  registarChegadaDeposito: (encomendaId: string): void => {
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!encomenda) return;
    encomenda.chegouDeposito = true;
    encomenda.statusEncomenda = 'CHEGOU_DEPOSITO';
    encomenda.dataChegada = new Date().toISOString();
    encomenda.dataUltimaActualizacao = new Date().toISOString();
    persistirTudo();
  },

  registarEntregaCliente: (encomendaId: string, assinatura: string): void => {
    const encomenda = store.encomendas.find((e) => e.id === encomendaId);
    if (!encomenda) return;

    encomenda.entregueAoCliente = true;
    encomenda.assinaturaEntrega = assinatura;
    encomenda.dataEntrega = new Date().toISOString();
    encomenda.statusEncomenda = 'ENTREGUE';
    encomenda.dataUltimaActualizacao = new Date().toISOString();

    // Se já está PAGO, consideramos completamente fechada (nada adicional aqui
    // porque o estado já reflecte isso; testes de alto nível verificam).

    persistirTudo();
  },

  // --- CLIENTES ---
  criarOuActualizarCliente: (dados): string => {
    const existente = store.clientes.find(
      (c) => c.telefone === dados.telefone
    );
    if (existente) {
      existente.nome = dados.nome;
      existente.email = dados.email;
      return existente.id;
    }

    const id = `CLI-${store.clientes.length + 1}`;
    const agora = new Date().toISOString();
    const novo: Cliente = {
      id,
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
      encomendaIds: [],
      totalGasto: 0,
      totalDivida: 0,
      dataCriacao: agora,
    };
    store.clientes = [...store.clientes, novo];
    persistirTudo();
    return id;
  },

  // --- GETTERS ---
  getEncomenda: (id: string): Encomenda | undefined =>
    store.encomendas.find((e) => e.id === id),

  getViagem: (id: string): Viagem | undefined =>
    store.viagens.find((v) => v.id === id),

  getEncomendasViagem: (viagemId: string): Encomenda[] =>
    store.encomendas.filter((e) => e.viagemId === viagemId),

  getEncomendasCliente: (telefone: string): Encomenda[] =>
    store.encomendas.filter((e) => e.clienteTelefone === telefone),

  getDividasEmAberto: (): Encomenda[] =>
    store.encomendas.filter((e) => e.valorDivida > 0),

  getEncomendasAtrasadas: (diasLimite: number): Encomenda[] => {
    const agora = Date.now();
    const limiteMs = diasLimite * 24 * 60 * 60 * 1000;
    return store.encomendas.filter((e) => {
      // Atrasada = encomenda com dívida > 0 e NAO_PAGO há mais de X dias
      if (e.statusPagamento !== 'NAO_PAGO' || e.valorDivida <= 0) return false;
      const dataRef = e.dataCriacao || e.dataUltimaActualizacao;
      if (!dataRef) return false;
      const diff = agora - new Date(dataRef).getTime();
      return diff > limiteMs;
    });
  },
  getProximoIdEncomenda: (): string => {
    const ano = new Date().getFullYear();
    const prefixo = `VML-${ano}-`;
    const numerosExistentes = store.encomendas
      .filter((e) => e.id.startsWith(prefixo))
      .map((e) => {
        const partes = e.id.split('-');
        const seq = partes[2];
        const n = Number(seq);
        return Number.isFinite(n) ? n : 0;
      });
    const proximoNumero =
      (numerosExistentes.length ? Math.max(...numerosExistentes) : 0) + 1;
    return `${prefixo}${proximoNumero.toString().padStart(4, '0')}`;
  },
  getProximoIdViagem: (): string => {
    const prefixo = 'VGM-';
    const numerosExistentes = store.viagens
      .filter((v) => v.id.startsWith(prefixo))
      .map((v) => {
        const seq = v.id.replace(prefixo, '');
        const n = Number(seq);
        return Number.isFinite(n) ? n : 0;
      });
    const proximoNumero =
      (numerosExistentes.length ? Math.max(...numerosExistentes) : 0) + 1;
    return `${prefixo}${proximoNumero.toString().padStart(3, '0')}`;
  },
};

// --- Hidratação inicial ---

function hidratarEstado(): void {
  if (!hasLocalStorage()) {
    // Sem localStorage (ex. testes), usar apenas defaults em memória
    if (!store.gestores.length) {
      store.gestores = [...GESTORES_INICIAIS];
    }
    store.cambioActual = DEFAULT_CAMBIO;
    store.taxaTransportePadrao = DEFAULT_TAXA_TRANSPORTE;
    store.gestorLogado = store.gestores[0] ?? null;
    return;
  }

  const snap = loadJSON<SnapshotPersistido>(PERSIST_KEY);

  if (!snap) {
    // Seed inicial
    store.encomendas = [];
    store.viagens = [];
    store.clientes = [];
    store.gestores = [...GESTORES_INICIAIS];
    store.cambioActual = DEFAULT_CAMBIO;
    store.taxaTransportePadrao = DEFAULT_TAXA_TRANSPORTE;
    store.gestorLogado = store.gestores[0] ?? null;
    persistirTudo();
    return;
  }

  store.encomendas = snap.encomendas ?? [];
  store.viagens = snap.viagens ?? [];
  store.clientes = snap.clientes ?? [];
  store.gestores =
    snap.gestores && snap.gestores.length
      ? snap.gestores
      : [...GESTORES_INICIAIS];
  store.cambioActual = snap.cambioActual ?? DEFAULT_CAMBIO;
  store.taxaTransportePadrao =
    snap.taxaTransportePadrao ?? DEFAULT_TAXA_TRANSPORTE;

  if (snap.gestorLogadoId) {
    store.gestorLogado =
      store.gestores.find((g) => g.id === snap.gestorLogadoId) ??
      store.gestores[0] ??
      null;
  } else {
    store.gestorLogado = store.gestores[0] ?? null;
  }
}

function persistirTudo(): void {
  const snap: SnapshotPersistido = {
    encomendas: store.encomendas,
    viagens: store.viagens,
    clientes: store.clientes,
    gestores: store.gestores,
    cambioActual: store.cambioActual,
    taxaTransportePadrao: store.taxaTransportePadrao,
    gestorLogadoId: store.gestorLogado?.id ?? null,
  };
  saveJSON(PERSIST_KEY, snap);
}

// Executar hidratação ao carregar o módulo
hidratarEstado();

// Export da instância única do estado
export const vmStore = store;

// Helpers simples para debug em consola durante desenvolvimento
export function debugVmStoreResumo(): void {
  // eslint-disable-next-line no-console
  console.log('[VM Lirandzu] Estado actual:', {
    encomendas: vmStore.encomendas.length,
    viagens: vmStore.viagens.length,
    clientes: vmStore.clientes.length,
    gestores: vmStore.gestores.length,
    cambioActual: vmStore.cambioActual,
    taxaTransportePadrao: vmStore.taxaTransportePadrao,
  });
}

