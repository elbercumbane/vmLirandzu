package com.lirandzo.service;

import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
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

    public List<Cotacao> findAll() {
        return cotacaoRepository.findAllWithCliente();
    }

    public Optional<Cotacao> findById(Long id) {
        Optional<Cotacao> cotacao = cotacaoRepository.findById(id);
        // Garantir que o cliente está carregado
        cotacao.ifPresent(c -> {
            if (c.getCliente() != null) {
                c.getCliente().getId(); // Força carregamento lazy
            }
        });
        return cotacao;
    }

    public Cotacao save(Cotacao cotacao) {
        Cotacao saved = cotacaoRepository.save(cotacao);
        // Gerar referência se não existir
        if (saved.getReferencia() == null || saved.getReferencia().isEmpty()) {
            saved.setReferencia("COT-" + LocalDate.now().getYear() + "-" + String.format("%04d", saved.getId()));
            saved = cotacaoRepository.save(saved);
        }
        return saved;
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
                    if (cotacaoAtualizada.getStatus() == StatusCotacao.RESPONDIDO || 
                        cotacaoAtualizada.getStatus() == StatusCotacao.COTACAO_GERADA) {
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
