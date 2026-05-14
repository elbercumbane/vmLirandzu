package com.lirandzo.service;

import com.lirandzo.dto.RastreamentoTimelineDTO;
import com.lirandzo.dto.RastreamentoTimelineDTO.RastreamentoEventoDTO;
import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.entity.Viagem;
import com.lirandzo.repository.EncomendaRepository;
import com.lirandzo.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class RastreamentoService {

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    public Optional<RastreamentoTimelineDTO> obterTimeline(Long numeroEncomenda) {
        Optional<Encomenda> opt = encomendaRepository.findWithRastreamentoById(numeroEncomenda);
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        Encomenda e = opt.get();
        Cotacao cot = e.getCotacao();
        if (cot != null) {
            cot.getId();
        }
        Viagem v = e.getViagem();
        if (v != null) {
            v.getStatus();
        }

        List<RastreamentoEventoDTO> eventos = new ArrayList<>();

        if (cot != null) {
            LocalDateTime dtCriacao = cot.getDataCriacao() != null
                    ? cot.getDataCriacao()
                    : LocalDateTime.of(
                            cot.getDataCotacao() != null ? cot.getDataCotacao() : LocalDate.now(),
                            LocalTime.MIDNIGHT);
            eventos.add(new RastreamentoEventoDTO(
                    "COTACAO_REGISTADA",
                    "Pedido / cotação registada",
                    cot.getReferencia() != null ? "Ref. " + cot.getReferencia() : null,
                    dtCriacao,
                    true));

            StatusCotacao st = cot.getStatus();
            if (st != null && (st == StatusCotacao.QUOTATION_GENERATED
                    || st == StatusCotacao.RESPONDED
                    || st == StatusCotacao.INVOICED)) {
                LocalDateTime dtProposta = cot.getDataCotacao() != null
                        ? LocalDateTime.of(cot.getDataCotacao(), LocalTime.of(9, 0))
                        : dtCriacao.plusHours(1);
                eventos.add(new RastreamentoEventoDTO(
                        "PROPOSTA",
                        "Proposta enviada ao cliente",
                        null,
                        dtProposta,
                        true));
            }

            if (st != null && (st == StatusCotacao.RESPONDED || st == StatusCotacao.INVOICED)
                    && cot.getDataResposta() != null) {
                eventos.add(new RastreamentoEventoDTO(
                        "ACEITE",
                        "Aceitação / resposta do cliente",
                        null,
                        cot.getDataResposta(),
                        true));
            }
        }

        LocalDateTime dtFactura = e.getInvoiceDate() != null
                ? LocalDateTime.of(e.getInvoiceDate(), LocalTime.of(9, 0))
                : (e.getDataEncomenda() != null
                        ? LocalDateTime.of(e.getDataEncomenda(), LocalTime.of(9, 0))
                        : LocalDateTime.now());
        eventos.add(new RastreamentoEventoDTO(
                "FACTURA",
                "Factura emitida",
                e.getInvoiceNumber() != null ? e.getInvoiceNumber() : "VML-" + e.getNumeroEncomenda(),
                dtFactura,
                true));

        List<Pagamento> pagamentos = new ArrayList<>(
                pagamentoRepository.findByEncomendaNumeroEncomendaOrderByIdDesc(numeroEncomenda));
        pagamentos.sort(Comparator.comparing(
                p -> p.getDataPagamento() != null ? p.getDataPagamento() : LocalDate.now()));

        for (Pagamento p : pagamentos) {
            boolean confirmado = p.getVerificationStatus() == Pagamento.VerificationStatus.CONFIRMED;
            LocalDateTime dt = p.getDataPagamento() != null
                    ? LocalDateTime.of(p.getDataPagamento(), LocalTime.NOON)
                    : LocalDateTime.now();
            String titulo = confirmado ? "Pagamento confirmado" : "Pagamento aguarda confirmação (extrato)";
            String detalhe = String.format("%.2f MZN", p.getValor() != null ? p.getValor() : 0.0);
            if (p.getMetodoPagamento() != null && !p.getMetodoPagamento().isBlank()) {
                detalhe += " · " + p.getMetodoPagamento();
            }
            eventos.add(new RastreamentoEventoDTO(
                    confirmado ? "PAGAMENTO_OK" : "PAGAMENTO_PENDENTE",
                    titulo,
                    detalhe,
                    dt,
                    confirmado));
        }

        if (v != null) {
            Viagem.StatusViagem vs = v.getStatus();
            if (v.getDataPartida() != null) {
                eventos.add(new RastreamentoEventoDTO(
                        "VIAGEM_PLAN",
                        "Viagem planead",
                        v.getOrigem() + " → " + v.getDestino(),
                        LocalDateTime.of(v.getDataPartida(), LocalTime.of(6, 0)),
                        true));
            }
            if (vs == Viagem.StatusViagem.IN_PROGRESS || vs == Viagem.StatusViagem.COMPLETED) {
                eventos.add(new RastreamentoEventoDTO(
                        "VIAGEM_TRANSITO",
                        "Em trânsito",
                        null,
                        v.getDataPartida() != null
                                ? LocalDateTime.of(v.getDataPartida(), LocalTime.of(8, 0))
                                : LocalDateTime.now().minusDays(1),
                        true));
            }
            if (vs == Viagem.StatusViagem.COMPLETED) {
                LocalDateTime dtEntrega = v.getDataChegadaReal() != null
                        ? LocalDateTime.of(v.getDataChegadaReal(), LocalTime.of(17, 0))
                        : LocalDateTime.now();
                eventos.add(new RastreamentoEventoDTO(
                        "ENTREGA",
                        "Entrega concluída",
                        v.getDestino(),
                        dtEntrega,
                        true));
            }
        }

        eventos.sort(Comparator.comparing(RastreamentoEventoDTO::dataOcorrencia));

        int total = eventos.size();
        long concluidos = eventos.stream().filter(RastreamentoEventoDTO::concluido).count();
        int pct = total == 0 ? 0 : (int) Math.round(100.0 * concluidos / total);

        String refCot = cot != null && cot.getReferencia() != null ? cot.getReferencia() : null;

        return Optional.of(new RastreamentoTimelineDTO(
                e.getNumeroEncomenda(),
                e.getTrackingCode(),
                e.getInvoiceNumber(),
                refCot,
                eventos,
                pct));
    }
}
