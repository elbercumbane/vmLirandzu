package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Recibo emitido automaticamente quando um pagamento fica confirmado (baixa na factura).
 */
@Entity
@Table(name = "recibos")
@Getter
@Setter
@NoArgsConstructor
public class Recibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter(AccessLevel.NONE)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Pagamento pagamento;

    @JsonIgnore
    public Pagamento getPagamento() {
        return pagamento;
    }

    /** Ex.: RCB-2026-00042 */
    @Column(name = "public_number", nullable = false, unique = true, length = 32)
    private String numeroPublico;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false)
    private Integer sequencia;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "amount", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private Double valor;

    @Column(name = "customer_name", length = 200)
    private String clienteNome;

    @Column(name = "invoice_number", length = 80)
    private String numeroFactura;

    @Column(name = "payment_reference", length = 100)
    private String referenciaPagamento;

    @Column(name = "payment_method", length = 50)
    private String metodoPagamento;

    @JsonProperty("pagamentoId")
    public Long getPagamentoId() {
        return pagamento != null ? pagamento.getId() : null;
    }
}
