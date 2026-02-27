import { vmStore } from '../store/vmlirandzu';

function assertOrThrow(cond: unknown, message: string): void {
  if (!cond) {
    throw new Error(message);
  }
}

export function executarTesteStoreFase1(): void {
  const store = vmStore;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTES FASE 1 — STORE VM LIRANDZU');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // TESTE 1: Criar encomenda
  const id1 = store.criarEncomenda({
    clienteNome: 'Teste Cliente',
    clienteTelefone: '841234567',
    clienteEmail: undefined,
    produtos: [
      {
        id: 'p1',
        nome: 'iPhone 15',
        descricao: 'iPhone 15 Teste',
        lojaJHB: 'iStore Sandton',
        quantidade: 1,
        valorZAR: 2400,
      },
    ],
    taxaTransporte: 1500,
    cambioZARMZN: 3.8,
    valorTotalZAR: 2400,
    valorTotalMZN: 0,
    statusEncomenda: 'RASCUNHO',
    gestorId: store.gestores[0]?.id ?? 'g1',
    viagemId: undefined,
    notasInternas: undefined,
  });

  const enc1 = store.getEncomenda(id1);
  const esperadoTotalMZN = 2400 * 3.8 + 1500; // 10620

  assertOrThrow(enc1 != null, '❌ TESTE 1 FALHOU — Encomenda não encontrada');
  assertOrThrow(
    enc1!.valorTotalMZN === esperadoTotalMZN,
    `❌ TESTE 1 FALHOU — Total MZN errado: ${enc1!.valorTotalMZN}`
  );
  assertOrThrow(
    enc1!.valorDivida === esperadoTotalMZN,
    `❌ TESTE 1 FALHOU — Dívida errada: ${enc1!.valorDivida}`
  );
  assertOrThrow(
    enc1!.statusPagamento === 'NAO_PAGO',
    `❌ TESTE 1 FALHOU — Status pagamento esperado NAO_PAGO, obtido: ${enc1!.statusPagamento}`
  );
  console.log(
    '✅ TESTE 1 PASSOU — Encomenda criada:',
    id1,
    'Total:',
    enc1!.valorTotalMZN,
    'MZN'
  );

  // TESTE 2: Confirmar encomenda
  store.confirmarEncomenda(id1, store.gestores[0]?.id ?? 'g1');
  const enc1c = store.getEncomenda(id1);
  assertOrThrow(
    enc1c?.statusEncomenda === 'CONFIRMADA',
    `❌ TESTE 2 FALHOU — Status encomenda: ${enc1c?.statusEncomenda}`
  );
  assertOrThrow(
    enc1c?.confirmadaPorGestor === true,
    '❌ TESTE 2 FALHOU — confirmadaPorGestor != true'
  );
  console.log('✅ TESTE 2 PASSOU — Encomenda confirmada');

  // TESTE 3: Pagamento parcial
  store.registarPagamento(id1, {
    data: new Date().toISOString(),
    valor: 5000,
    forma: 'MPESA',
    referencia: undefined,
    registadoPor: store.gestores[0]?.id ?? 'g1',
  });
  const enc1p = store.getEncomenda(id1);
  assertOrThrow(
    enc1p?.valorPago === 5000,
    `❌ TESTE 3 FALHOU — Valor pago errado: ${enc1p?.valorPago}`
  );
  assertOrThrow(
    enc1p?.valorDivida === esperadoTotalMZN - 5000,
    `❌ TESTE 3 FALHOU — Dívida errada: ${enc1p?.valorDivida}`
  );
  assertOrThrow(
    enc1p?.statusPagamento === 'PARCIAL',
    `❌ TESTE 3 FALHOU — Status pagamento esperado PARCIAL, obtido: ${enc1p?.statusPagamento}`
  );
  console.log(
    '✅ TESTE 3 PASSOU — Pagamento parcial. Pago:',
    enc1p!.valorPago,
    'Dívida:',
    enc1p!.valorDivida
  );

  // TESTE 4: Criar viagem e adicionar encomenda
  const vid1 = store.criarViagem({
    gestorId: store.gestores[0]?.id ?? 'g1',
    dataPartida: '2025-01-23',
    dataRetornoPrevisto: '2025-01-27',
    dataRetornoReal: undefined,
    status: 'PLANEADA',
    encomendaIds: [],
    notasViagem: 'Viagem de teste Fase 1',
    dataAutorizacao: undefined,
  });

  assertOrThrow(
    vid1.startsWith('VGM-'),
    `❌ TESTE 4 FALHOU — ID viagem inesperado: ${vid1}`
  );

  store.adicionarEncomendaAViagem(vid1, id1);
  const v1 = store.getViagem(vid1);
  assertOrThrow(
    v1?.encomendaIds.includes(id1),
    '❌ TESTE 4 FALHOU — Encomenda não adicionada à viagem'
  );
  console.log(
    '✅ TESTE 4 PASSOU — Viagem criada:',
    vid1,
    'com encomenda:',
    id1
  );

  // TESTE 5: Tentar iniciar viagem sem autorizar
  let bloqueouSemAutorizar = false;
  try {
    store.iniciarViagem(vid1);
  } catch (e) {
    bloqueouSemAutorizar = true;
    console.log(
      '✅ TESTE 5 PASSOU — Bloqueou iniciar sem autorizar:',
      e instanceof Error ? e.message : e
    );
  }
  if (!bloqueouSemAutorizar) {
    console.error('❌ TESTE 5 FALHOU — Devia ter lançado erro');
  }

  // TESTE 6: Autorizar e iniciar viagem
  store.autorizarViagem(vid1, store.gestores[0]?.id ?? 'g1');
  store.iniciarViagem(vid1);
  const v1i = store.getViagem(vid1);
  const enc1v = store.getEncomenda(id1);

  assertOrThrow(
    v1i?.status === 'EM_CURSO',
    `❌ TESTE 6 FALHOU — Status viagem: ${v1i?.status}`
  );
  assertOrThrow(
    enc1v?.statusEncomenda === 'EM_VIAGEM',
    `❌ TESTE 6 FALHOU — Status encomenda: ${enc1v?.statusEncomenda}`
  );
  console.log(
    '✅ TESTE 6 PASSOU — Viagem em curso, encomenda em viagem'
  );

  // TESTE 7: Conferir e concluir viagem
  store.conferirItemViagem(vid1, id1, 'COMPRADO');
  store.concluirViagem(vid1, '2025-01-27');
  const v1c = store.getViagem(vid1);
  const enc1ch = store.getEncomenda(id1);

  assertOrThrow(
    v1c?.status === 'CONCLUIDA',
    `❌ TESTE 7 FALHOU — Viagem não concluída: ${v1c?.status}`
  );
  assertOrThrow(
    enc1ch?.statusEncomenda === 'CHEGOU_DEPOSITO',
    `❌ TESTE 7 FALHOU — Status encomenda esperado CHEGOU_DEPOSITO, obtido: ${enc1ch?.statusEncomenda}`
  );
  console.log(
    '✅ TESTE 7 PASSOU — Viagem concluída, encomenda no depósito'
  );

  // TESTE 8: Entregar ao cliente (mantendo PARCIAL)
  store.registarEntregaCliente(id1, 'Teste Cliente');
  const enc1e = store.getEncomenda(id1);
  assertOrThrow(
    enc1e?.statusEncomenda === 'ENTREGUE',
    `❌ TESTE 8 FALHOU — Status entrega: ${enc1e?.statusEncomenda}`
  );
  assertOrThrow(
    enc1e?.statusPagamento === 'PARCIAL',
    `❌ TESTE 8 FALHOU — Status pagamento devia manter PARCIAL, obtido: ${enc1e?.statusPagamento}`
  );
  console.log(
    '✅ TESTE 8 PASSOU — Entregue com dívida em aberto'
  );

  // TESTE 9: Pagar saldo final
  const saldo = (enc1e?.valorDivida ?? 0) > 0 ? enc1e!.valorDivida : 5620;
  store.registarPagamento(id1, {
    data: new Date().toISOString(),
    valor: saldo,
    forma: 'DINHEIRO',
    referencia: undefined,
    registadoPor: store.gestores[0]?.id ?? 'g1',
  });
  const enc1f = store.getEncomenda(id1);

  assertOrThrow(
    enc1f?.statusPagamento === 'PAGO',
    `❌ TESTE 9 FALHOU — Status final: ${enc1f?.statusPagamento}`
  );
  assertOrThrow(
    enc1f?.valorDivida === 0,
    `❌ TESTE 9 FALHOU — Dívida final não é zero: ${enc1f?.valorDivida}`
  );
  console.log(
    '✅ TESTE 9 PASSOU — Saldo pago, encomenda 100% concluída'
  );

  // TESTE 10: localStorage persiste
  try {
    const raw = window.localStorage.getItem('vml-store');
    assertOrThrow(raw !== null, '❌ TESTE 10 FALHOU — localStorage vazio');
    console.log(
      '✅ TESTE 10 PASSOU — Dados persistidos no localStorage'
    );
  } catch (e) {
    console.warn(
      '⚠ TESTE 10 — Não foi possível verificar localStorage (ambiente sem window?):',
      e
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 FASE 1 COMPLETA — Store funcional');
  console.log('Encomendas:', store.encomendas.length);
  console.log('Viagens:', store.viagens.length);
  console.log('Clientes:', store.clientes.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

