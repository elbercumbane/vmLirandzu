// Quick internal test for vmStore logic (executed via ts-node / Node, não faz parte da UI)
import { vmStore, debugVmStoreResumo } from '../store/vmlirandzu';

function assertCond(cond: unknown, message: string): void {
  if (!cond) {
    throw new Error(`ASSERT FALHOU: ${message}`);
  }
}

function testeBasico(): void {
  // Estado inicial em ambiente de teste (sem localStorage)
  console.log('--- VM Lirandzu: Quick Test do Store ---');
  debugVmStoreResumo();

  // Deve ter gestores de seed
  assertCond(
    vmStore.gestores.length === 3,
    'Deve iniciar com 3 gestores seed'
  );

  // Criar encomenda simples
  const encomendaId = vmStore.criarEncomenda({
    clienteNome: 'Cliente Teste Quick',
    clienteTelefone: '840000000',
    clienteEmail: 'quick@test.com',
    produtos: [
      {
        id: 'P-QUICK-1',
        nome: 'iPhone 15',
        descricao: 'Teste quick',
        lojaJHB: 'Loja A',
        quantidade: 1,
        valorZAR: 2400,
        linkProduto: '',
      },
    ],
    taxaTransporte: vmStore.taxaTransportePadrao,
    cambioZARMZN: vmStore.cambioActual,
    valorTotalZAR: 0,
    valorTotalMZN: 0,
    statusEncomenda: 'RASCUNHO',
    gestorId: vmStore.gestores[0]?.id ?? 'GEST-TEST',
    viagemId: undefined,
    notasInternas: undefined,
  });

  console.log('Encomenda criada com ID:', encomendaId);
  assertCond(
    /^VML-\d{4}-\d{4}$/.test(encomendaId),
    'ID da encomenda deve respeitar o formato VML-AAAA-NNNN'
  );

  const enc = vmStore.getEncomenda(encomendaId);
  assertCond(!!enc, 'Encomenda recém-criada deve existir no store');

  if (!enc) {
    return;
  }

  // Total ZAR deve ser 2400 (1 * 2400)
  assertCond(enc.valorTotalZAR === 2400, 'valorTotalZAR deve ser 2400');

  const esperadoTotalMZN =
    enc.valorTotalZAR * enc.cambioZARMZN + enc.taxaTransporte;
  assertCond(
    enc.valorTotalMZN === esperadoTotalMZN,
    'valorTotalMZN deve seguir a fórmula (ZAR * cambio) + taxaTransporte'
  );

  // Estado de pagamento inicial
  assertCond(enc.valorPago === 0, 'valorPago inicial deve ser 0');
  assertCond(
    enc.valorDivida === enc.valorTotalMZN,
    'valorDivida inicial deve ser igual ao total MZN'
  );
  assertCond(
    enc.statusPagamento === 'NAO_PAGO',
    "statusPagamento inicial deve ser 'NAO_PAGO'"
  );
  assertCond(
    enc.statusEncomenda === 'RASCUNHO',
    "statusEncomenda inicial deve ser 'RASCUNHO'"
  );

  // Confirmar encomenda
  vmStore.confirmarEncomenda(encomendaId, enc.gestorId);
  const encConfirmada = vmStore.getEncomenda(encomendaId)!;
  assertCond(
    encConfirmada.statusEncomenda === 'CONFIRMADA',
    "Após confirmar, statusEncomenda deve ser 'CONFIRMADA'"
  );
  assertCond(
    encConfirmada.confirmadaPorGestor,
    'Encomenda deve ficar marcada como confirmadaPorGestor=true'
  );

  // Registar pagamento total
  vmStore.registarPagamento(encomendaId, {
    data: new Date().toISOString(),
    valor: encConfirmada.valorTotalMZN,
    forma: 'DINHEIRO',
    referencia: 'QUICK-1',
    registadoPor: encConfirmada.gestorId,
  });

  const encPaga = vmStore.getEncomenda(encomendaId)!;
  assertCond(
    encPaga.valorPago === encPaga.valorTotalMZN,
    'Pagamento total deve igualar o total MZN'
  );
  assertCond(encPaga.valorDivida === 0, 'Após pagamento, divida deve ser 0');
  assertCond(
    encPaga.statusPagamento === 'PAGO',
    "Após pagamento total, statusPagamento deve ser 'PAGO'"
  );

  // Criar viagem com esta encomenda
  const viagemId = vmStore.criarViagem({
    gestorId: encPaga.gestorId,
    dataPartida: new Date().toISOString(),
    dataRetornoPrevisto: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    dataRetornoReal: undefined,
    status: 'PLANEADA',
    encomendaIds: [encomendaId],
    notasViagem: 'Viagem quick test',
    dataAutorizacao: undefined,
  });

  console.log('Viagem criada com ID:', viagemId);

  const viagem = vmStore.getViagem(viagemId);
  assertCond(!!viagem, 'Viagem recém-criada deve existir no store');

  // Autorizar viagem
  vmStore.autorizarViagem(viagemId, encPaga.gestorId);
  const viagemAut = vmStore.getViagem(viagemId)!;
  assertCond(
    viagemAut.autorizadaPorGestor,
    'Viagem deve ficar com autorizadaPorGestor=true após autorização'
  );

  // Iniciar viagem
  vmStore.iniciarViagem(viagemId);
  const viagemEmCurso = vmStore.getViagem(viagemId)!;
  assertCond(
    viagemEmCurso.status === 'EM_CURSO',
    "Após iniciar, status da viagem deve ser 'EM_CURSO'"
  );

  const encEmViagem = vmStore.getEncomenda(encomendaId)!;
  assertCond(
    encEmViagem.statusEncomenda === 'EM_VIAGEM',
    "Após iniciar viagem, encomenda deve ficar 'EM_VIAGEM'"
  );

  console.log('Quick test passou com sucesso ✅');
}

// Executar se chamado directamente (ex.: npx ts-node src/debug/vmStoreQuickTest.ts)
testeBasico();

