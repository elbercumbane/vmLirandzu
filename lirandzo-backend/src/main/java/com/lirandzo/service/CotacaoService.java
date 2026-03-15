package com.lirandzo.service;

import com.lirandzo.dto.CotacaoPortalRequestDTO;
import com.lirandzo.entity.Cliente;
import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import com.lirandzo.repository.ClienteRepository;
import com.lirandzo.repository.CotacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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

        cotacaoRepository.save(cotacao);
    }

    public Optional<Cotacao> update(Long id, Cotacao cotacaoAtualizada) {
        return cotacaoRepository.findById(id)
                .map(cotacao -> {
                    cotacao.setCliente(cotacaoAtualizada.getCliente());
                    cotacao.setOrigem(cotacaoAtualizada.getOrigem());
                    cotacao.setDestino(cotacaoAtualizada.getDestino());
                    cotacao.setTipoVeiculo(cotacaoAtualizada.getTipoVeiculo());
                    cotacao.setDescricaoCarga(cotacaoAtualizada.getDescricaoCarga());
                    cotacao.setValorTotal(cotacaoAtualizada.getValorTotal());
                    cotacao.setCustoTransporte(cotacaoAtualizada.getCustoTransporte());
                    cotacao.setCustoRecolha(cotacaoAtualizada.getCustoRecolha());
                    cotacao.setCustoBillOfEntry(cotacaoAtualizada.getCustoBillOfEntry());
                    cotacao.setDataCotacao(cotacaoAtualizada.getDataCotacao());
                    cotacao.setDataValidade(cotacaoAtualizada.getDataValidade());
                    cotacao.setStatus(cotacaoAtualizada.getStatus());
                    cotacao.setObservacoes(cotacaoAtualizada.getObservacoes());
                    cotacao.setCondicoes(cotacaoAtualizada.getCondicoes());
                    cotacao.setOperador(cotacaoAtualizada.getOperador());
                    cotacao.setFormaEnvioPreferida(cotacaoAtualizada.getFormaEnvioPreferida());
                    cotacao.setFormaEnvioRealizada(cotacaoAtualizada.getFormaEnvioRealizada());
                    if (cotacaoAtualizada.getStatus() == StatusCotacao.RESPONDED ||
                        cotacaoAtualizada.getStatus() == StatusCotacao.QUOTATION_GENERATED) {
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
