package com.lirandzo.service;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.entity.Pagamento.VerificationStatus;
import com.lirandzo.entity.Recibo;
import com.lirandzo.repository.PagamentoRepository;
import com.lirandzo.repository.ReciboRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class ReciboService {

    @Autowired
    private ReciboRepository reciboRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    public List<Recibo> findAll() {
        return reciboRepository.findAllByOrderByDataEmissaoDescIdDesc();
    }

    public Optional<Recibo> findById(Long id) {
        return reciboRepository.findById(id);
    }

    /**
     * Idempotente: um recibo por pagamento confirmado. Chamado após o pagamento passar a CONFIRMED.
     */
    public void gerarReciboSeNecessario(Long pagamentoId) {
        if (pagamentoId == null) {
            return;
        }
        if (reciboRepository.findByPagamento_Id(pagamentoId).isPresent()) {
            return;
        }
        Pagamento p = pagamentoRepository.findWithDetailsById(pagamentoId).orElse(null);
        if (p == null || p.getVerificationStatus() != VerificationStatus.CONFIRMED) {
            return;
        }
        Encomenda enc = p.getEncomenda();
        if (enc == null) {
            return;
        }
        String clienteNome = enc.getCliente() != null ? enc.getCliente().getNome() : null;
        String factura = enc.getInvoiceNumber();
        int ano = LocalDateTime.now().getYear();
        synchronized (this) {
            int seq = reciboRepository.findMaxSequenciaByAno(ano) + 1;
            String numeroPublico = String.format(Locale.ROOT, "RCB-%d-%05d", ano, seq);
            Recibo r = new Recibo();
            r.setPagamento(p);
            r.setNumeroPublico(numeroPublico);
            r.setAno(ano);
            r.setSequencia(seq);
            r.setDataEmissao(LocalDateTime.now());
            r.setValor(p.getValor());
            r.setClienteNome(clienteNome);
            r.setNumeroFactura(factura);
            r.setReferenciaPagamento(p.getReferencia());
            r.setMetodoPagamento(p.getMetodoPagamento());
            reciboRepository.save(r);
        }
    }
}
