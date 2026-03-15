package com.lirandzo.service;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.repository.EncomendaRepository;
import com.lirandzo.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PagamentoService {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private EncomendaRepository encomendaRepository;

    public List<Pagamento> findAll() {
        return pagamentoRepository.findAll();
    }

    public Optional<Pagamento> findById(Long id) {
        return pagamentoRepository.findById(id);
    }

    public Pagamento save(Pagamento pagamento) {
        Pagamento saved = pagamentoRepository.save(pagamento);
        
        // Update order amounts
        if (saved.getEncomenda() != null) {
            Encomenda encomenda = encomendaRepository.findById(saved.getEncomenda().getNumeroEncomenda()).orElse(null);
            if (encomenda != null) {
                double totalPago = pagamentoRepository.findByEncomendaNumeroEncomenda(encomenda.getNumeroEncomenda()).stream()
                        .mapToDouble(p -> p.getValor() != null ? p.getValor() : 0.0)
                        .sum();
                encomenda.setValorPago(totalPago);
                encomendaRepository.save(encomenda);
            }
        }
        
        return saved;
    }

    public Optional<Pagamento> update(Long id, Pagamento pagamentoAtualizado) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    pagamento.setValor(pagamentoAtualizado.getValor());
                    pagamento.setDataPagamento(pagamentoAtualizado.getDataPagamento());
                    pagamento.setReferencia(pagamentoAtualizado.getReferencia());
                    pagamento.setObservacoes(pagamentoAtualizado.getObservacoes());
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    
                    // Update order amounts
                    if (saved.getEncomenda() != null) {
                        Encomenda encomenda = encomendaRepository.findById(saved.getEncomenda().getNumeroEncomenda()).orElse(null);
                        if (encomenda != null) {
                            double totalPago = pagamentoRepository.findByEncomendaNumeroEncomenda(encomenda.getNumeroEncomenda()).stream()
                                    .mapToDouble(p -> p.getValor() != null ? p.getValor() : 0.0)
                                    .sum();
                            encomenda.setValorPago(totalPago);
                            encomendaRepository.save(encomenda);
                        }
                    }
                    
                    return saved;
                });
    }

    public void deleteById(Long id) {
        Optional<Pagamento> pagamentoOpt = pagamentoRepository.findById(id);
        if (pagamentoOpt.isPresent()) {
            Encomenda encomenda = pagamentoOpt.get().getEncomenda();
            pagamentoRepository.deleteById(id);
            
            // Update order amounts
            if (encomenda != null) {
                double totalPago = pagamentoRepository.findByEncomendaNumeroEncomenda(encomenda.getNumeroEncomenda()).stream()
                        .mapToDouble(p -> p.getValor() != null ? p.getValor() : 0.0)
                        .sum();
                encomenda.setValorPago(totalPago);
                encomendaRepository.save(encomenda);
            }
        }
    }

    public List<Pagamento> findByEncomendaId(Long encomendaId) {
        return pagamentoRepository.findByEncomendaNumeroEncomenda(encomendaId);
    }
}
