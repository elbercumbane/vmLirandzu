package com.lirandzo.service;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Encomenda.StatusPagamento;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.repository.EncomendaRepository;
import com.lirandzo.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EncomendaService {

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PagamentoService pagamentoService;

    public List<Encomenda> findAll(StatusPagamento status, LocalDate dataInicio, LocalDate dataFim) {
        if (status != null) {
            return encomendaRepository.findByStatus(status);
        }
        if (dataInicio != null && dataFim != null) {
            return encomendaRepository.findByDataEncomendaBetween(dataInicio, dataFim);
        }
        return encomendaRepository.findAllWithCliente();
    }

    public Optional<Encomenda> findById(Long id) {
        Optional<Encomenda> encomenda = encomendaRepository.findById(id);
        encomenda.ifPresent(e -> {
            if (e.getCliente() != null) {
                e.getCliente().getId();
            }
            if (e.getTrackingCode() == null || e.getTrackingCode().isBlank()) {
                e.setTrackingCode(gerarCodigoRastreamento());
                encomendaRepository.save(e);
            }
        });
        return encomenda;
    }

    public Encomenda save(Encomenda encomenda) {
        boolean novo = encomenda.getNumeroEncomenda() == null;
        Encomenda saved = encomendaRepository.save(encomenda);
        if (novo && (saved.getInvoiceNumber() == null || saved.getInvoiceNumber().isBlank())) {
            LocalDate dataRef = saved.getDataEncomenda() != null ? saved.getDataEncomenda() : LocalDate.now();
            saved.setInvoiceNumber(gerarNumeroFactura(dataRef.getYear(), saved.getNumeroEncomenda()));
            saved.setInvoiceDate(dataRef);
            saved = encomendaRepository.save(saved);
        }
        if (saved.getTrackingCode() == null || saved.getTrackingCode().isBlank()) {
            saved.setTrackingCode(gerarCodigoRastreamento());
            saved = encomendaRepository.save(saved);
        }
        atualizarEstatisticasCliente(saved.getCliente().getId());
        return saved;
    }

    private static String gerarNumeroFactura(int ano, long numeroEncomenda) {
        return String.format("FAC-%d-%06d", ano, numeroEncomenda);
    }

    /** Código único para rastreio interno / futuro portal (TRK- + 12 hex). */
    private static String gerarCodigoRastreamento() {
        return "TRK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    public Optional<Encomenda> update(Long id, Encomenda encomendaAtualizada) {
        return encomendaRepository.findById(id)
                .map(encomenda -> {
                    Long clienteIdAntigo = encomenda.getCliente().getId();
                    
                    encomenda.setCliente(encomendaAtualizada.getCliente());
                    encomenda.setProduto(encomendaAtualizada.getProduto());
                    encomenda.setOrigem(encomendaAtualizada.getOrigem());
                    encomenda.setDestino(encomendaAtualizada.getDestino());
                    encomenda.setValorTotal(encomendaAtualizada.getValorTotal());
                    encomenda.setValorPago(encomendaAtualizada.getValorPago());
                    encomenda.setDataEncomenda(encomendaAtualizada.getDataEncomenda());
                    
                    Encomenda saved = encomendaRepository.save(encomenda);
                    
                    atualizarEstatisticasCliente(clienteIdAntigo);
                    if (!clienteIdAntigo.equals(saved.getCliente().getId())) {
                        atualizarEstatisticasCliente(saved.getCliente().getId());
                    }
                    
                    return saved;
                });
    }

    public void deleteById(Long id) {
        encomendaRepository.findById(id).ifPresent(encomenda -> {
            Long clienteId = encomenda.getCliente().getId();
            encomendaRepository.deleteById(id);
            atualizarEstatisticasCliente(clienteId);
        });
    }

    public List<Encomenda> findByClienteId(Long clienteId) {
        return encomendaRepository.findByClienteId(clienteId);
    }

    public Optional<Encomenda> adicionarPagamento(Long id, Double valor) {
        return encomendaRepository.findById(id)
                .map(encomenda -> {
                    Pagamento pagamento = new Pagamento();
                    pagamento.setEncomenda(encomenda);
                    pagamento.setValor(valor);
                    pagamento.setVerificationStatus(Pagamento.VerificationStatus.CONFIRMED);
                    pagamentoService.save(pagamento);
                    return encomendaRepository.findById(id).orElseThrow();
                });
    }

    private void atualizarEstatisticasCliente(Long clienteId) {
        clienteRepository.findById(clienteId).ifPresent(cliente -> {
            List<Encomenda> encomendas = encomendaRepository.findByClienteId(clienteId);
            
            double valorTotalFaturado = encomendas.stream()
                    .mapToDouble(e -> e.getValorTotal() != null ? e.getValorTotal() : 0.0)
                    .sum();
            
            double valorEmDivida = encomendas.stream()
                    .mapToDouble(e -> e.getValorDivida() != null ? e.getValorDivida() : 0.0)
                    .sum();
            
            cliente.setValorTotalFaturado(valorTotalFaturado);
            cliente.setValorEmDivida(valorEmDivida);
            cliente.setNumeroEncomendas(encomendas.size());
            
            clienteRepository.save(cliente);
        });
    }
}
