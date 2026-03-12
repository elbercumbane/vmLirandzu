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

@Service
@Transactional
public class EncomendaService {

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

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
        // Garantir que o cliente está carregado
        encomenda.ifPresent(e -> {
            if (e.getCliente() != null) {
                e.getCliente().getId(); // Força carregamento lazy
            }
        });
        return encomenda;
    }

    public Encomenda save(Encomenda encomenda) {
        Encomenda saved = encomendaRepository.save(encomenda);
        atualizarEstatisticasCliente(saved.getCliente().getId());
        return saved;
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
                    
                    encomenda.getPagamentos().add(pagamento);
                    encomenda.setValorPago(encomenda.getValorPago() + valor);
                    
                    Encomenda saved = encomendaRepository.save(encomenda);
                    atualizarEstatisticasCliente(saved.getCliente().getId());
                    
                    return saved;
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
