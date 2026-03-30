package com.lirandzo.service;

import com.lirandzo.dto.CotacaoPortalRequestDTO;
import com.lirandzo.entity.Cliente;
import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import com.lirandzo.entity.CondicaoPagamentoCotacao;
import com.lirandzo.repository.ClienteRepository;
import com.lirandzo.repository.CotacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class CotacaoService {

    @Autowired
    private CotacaoRepository cotacaoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cotacao> findAll() {
        return cotacaoRepository.findAllWithCliente();
    }

    public Optional<Cotacao> findById(Long id) {
        Optional<Cotacao> cotacao = cotacaoRepository.findById(id);
        // Ensure customer is loaded
        cotacao.ifPresent(c -> {
            if (c.getCliente() != null) {
                c.getCliente().getId(); // Force lazy loading
            }
        });
        return cotacao;
    }

    public Cotacao save(Cotacao cotacao) {
        Cotacao saved = cotacaoRepository.save(cotacao);
        // Generate reference if it does not exist
        if (saved.getReferencia() == null || saved.getReferencia().isEmpty()) {
            saved.setReferencia("COT-" + LocalDate.now().getYear() + "-" + String.format("%04d", saved.getId()));
            saved = cotacaoRepository.save(saved);
        }
        return saved;
    }

    public void criarPedidoAPartirDoPortal(CotacaoPortalRequestDTO dto) {
        // Tentar localizar cliente pelo e-mail, caso exista
        Cliente cliente = null;
        if (dto.email() != null && !dto.email().isBlank()) {
            cliente = clienteRepository.findAll().stream()
                    .filter(c -> dto.email().equalsIgnoreCase(c.getEmail()))
                    .findFirst()
                    .orElse(null);
        }

        if (cliente == null) {
            cliente = new Cliente();
            cliente.setNome(dto.nome() != null && !dto.nome().isBlank() ? dto.nome() : "Cliente Portal");
            cliente.setEmail(dto.email());
            cliente.setTelefone(dto.telefone1() != null && !dto.telefone1().isBlank()
                    ? dto.telefone1()
                    : dto.telefone2());
            aplicarDadosClientePortal(cliente, dto);
            cliente = clienteRepository.save(cliente);
        } else {
            aplicarDadosClientePortal(cliente, dto);
            cliente = clienteRepository.save(cliente);
        }

        Cotacao cotacao = new Cotacao();
        cotacao.setCliente(cliente);
        cotacao.setOrigem(dto.origem());
        cotacao.setDestino(dto.destino());
        cotacao.setDescricaoCarga(dto.mensagem());
        cotacao.setStatus(Cotacao.StatusCotacao.PENDING);
        cotacao.setObservacoes("Pedido vindo do portal");
        cotacao.setFormaEnvioPreferida(dto.formaEnvioPreferida());
        cotacao.setFontePedido("PORTAL");
        cotacao.setTipoServico(dto.tipoServico() != null && !dto.tipoServico().isBlank()
                ? dto.tipoServico().toUpperCase() : "TRANSPORTE");

        parseCondicaoPagamentoTexto(dto.condicaoPagamento()).ifPresent(cotacao::setCondicaoPagamento);

        cotacaoRepository.save(cotacao);
    }

    /** Preenche NUIT, morada, província e contacto quando o portal envia (todos opcionais). */
    private static void aplicarDadosClientePortal(Cliente cliente, CotacaoPortalRequestDTO dto) {
        if (dto.nuit() != null && !dto.nuit().isBlank()) {
            cliente.setNif(truncar(dto.nuit().trim(), 50));
        }
        if (dto.endereco() != null && !dto.endereco().isBlank()) {
            cliente.setEndereco(truncar(dto.endereco().trim(), 200));
        }
        if (dto.provincia() != null && !dto.provincia().isBlank()) {
            cliente.setProvincia(truncar(dto.provincia().trim(), 100));
        }
        if (dto.pessoaContacto() != null && !dto.pessoaContacto().isBlank()) {
            cliente.setPessoaContacto(truncar(dto.pessoaContacto().trim(), 200));
        }
    }

    private static String truncar(String s, int max) {
        if (s == null) {
            return null;
        }
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max);
    }

    private Optional<CondicaoPagamentoCotacao> parseCondicaoPagamentoTexto(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(CondicaoPagamentoCotacao.valueOf(raw.trim().toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException ignored) {
            return Optional.empty();
        }
    }

    public Optional<Cotacao> update(Long id, Cotacao cotacaoAtualizada) {
        return cotacaoRepository.findById(id)
                .map(cotacao -> {
                    cotacao.setCliente(cotacaoAtualizada.getCliente());
                    cotacao.setOrigem(cotacaoAtualizada.getOrigem());
                    cotacao.setDestino(cotacaoAtualizada.getDestino());
                    if (cotacaoAtualizada.getTipoServico() != null) cotacao.setTipoServico(cotacaoAtualizada.getTipoServico());
                    cotacao.setTipoVeiculo(cotacaoAtualizada.getTipoVeiculo());
                    cotacao.setDescricaoCarga(cotacaoAtualizada.getDescricaoCarga());
                    cotacao.setValorTotal(cotacaoAtualizada.getValorTotal());
                    cotacao.setCustoTransporte(cotacaoAtualizada.getCustoTransporte());
                    cotacao.setCustoRecolha(cotacaoAtualizada.getCustoRecolha());
                    cotacao.setCustoBillOfEntry(cotacaoAtualizada.getCustoBillOfEntry());

                    // Campos financeiros: só sobrescrever se vierem preenchidos.
                    // Caso contrário, preservamos o valor existente (evita gravar null vindo do frontend).
                    if (cotacaoAtualizada.getDiscountAmount() != null) {
                        cotacao.setDiscountAmount(cotacaoAtualizada.getDiscountAmount());
                    } else if (cotacao.getDiscountAmount() == null) {
                        cotacao.setDiscountAmount(0.00);
                    }
                    if (cotacaoAtualizada.getVatAmount() != null) {
                        cotacao.setVatAmount(cotacaoAtualizada.getVatAmount());
                    } else if (cotacao.getVatAmount() == null) {
                        cotacao.setVatAmount(0.00);
                    }
                    if (cotacaoAtualizada.getVatRate() != null) {
                        cotacao.setVatRate(cotacaoAtualizada.getVatRate());
                    } else if (cotacao.getVatRate() == null) {
                        cotacao.setVatRate(0.00);
                    }
                    if (cotacaoAtualizada.getVatReason() != null) {
                        cotacao.setVatReason(cotacaoAtualizada.getVatReason());
                    } else if (cotacao.getVatReason() == null || cotacao.getVatReason().isBlank()) {
                        cotacao.setVatReason("ISENTO");
                    }

                    // Regras financeiras automáticas:
                    // - Quando o tipo de serviço é "COMPRA_TRANSPORTE", aplica IVA de 16% (se não houver desconto, desconto=0).
                    // - Caso contrário, IVA fica ISENTO.
                    double desconto = cotacao.getDiscountAmount() != null ? cotacao.getDiscountAmount() : 0.0;
                    double base = cotacao.getValorTotal() != null ? cotacao.getValorTotal() : 0.0;
                    double baseAposDesconto = base - desconto;
                    if (baseAposDesconto < 0) baseAposDesconto = 0.0;

                    boolean temIva = cotacao.getTipoServico() != null
                            && "COMPRA_TRANSPORTE".equalsIgnoreCase(cotacao.getTipoServico());

                    if (temIva) {
                        cotacao.setVatRate(16.0);
                        cotacao.setVatReason("IVA 16%");
                        cotacao.setVatAmount(baseAposDesconto * 0.16);
                    } else {
                        cotacao.setVatRate(0.0);
                        cotacao.setVatAmount(0.0);
                        cotacao.setVatReason("ISENTO");
                    }
                    // dataCotacao e validade devem ser imutáveis:
                    //  - vêm do portal (quando fontePedido=PORTAL)
                    //  - ou correspondem à data "manual" de criação
                    // Mantemos o valor existente e recalculamos apenas a validade = dataCotacao + 7 dias.
                    if (cotacao.getDataCotacao() != null) {
                        cotacao.setDataValidade(cotacao.getDataCotacao().plusDays(7));
                    }
                    cotacao.setStatus(cotacaoAtualizada.getStatus());
                    cotacao.setObservacoes(cotacaoAtualizada.getObservacoes());
                    cotacao.setCondicoes(cotacaoAtualizada.getCondicoes());
                    if (cotacaoAtualizada.getCondicaoPagamento() != null) {
                        cotacao.setCondicaoPagamento(cotacaoAtualizada.getCondicaoPagamento());
                    }
                    cotacao.setOperador(cotacaoAtualizada.getOperador());
                    cotacao.setFormaEnvioPreferida(cotacaoAtualizada.getFormaEnvioPreferida());
                    cotacao.setFormaEnvioRealizada(cotacaoAtualizada.getFormaEnvioRealizada());
                    // RESPONDED = aceitação pelo cliente (após negociação / envio da proposta). Fecha o "tempo até resposta".
                    if (cotacaoAtualizada.getStatus() == StatusCotacao.RESPONDED) {
                        cotacao.setDataResposta(java.time.LocalDateTime.now());
                    }
                    return cotacaoRepository.save(cotacao);
                });
    }

    public void deleteById(Long id) {
        cotacaoRepository.deleteById(id);
    }

    public List<Cotacao> findByStatus(StatusCotacao status) {
        return cotacaoRepository.findByStatus(status);
    }

    public List<Cotacao> findByClienteId(Long clienteId) {
        return cotacaoRepository.findByClienteId(clienteId);
    }
}
