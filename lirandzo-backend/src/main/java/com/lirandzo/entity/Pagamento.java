package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"pagamentos", "viagem", "cotacao"})
    private Encomenda encomenda;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private Double valor;

    @Column(name = "payment_date")
    private LocalDate dataPagamento;

    /** Referência do banco, M-Pesa, e-Mola, etc. (para cruzar com extrato) */
    @Column(name = "reference", length = 100)
    private String referencia;

    @Column(name = "notes", length = 500)
    private String observacoes;

    @Column(name = "payment_method", length = 50)
    private String metodoPagamento;

    /**
     * CONFIRMED: contabiliza na dívida da encomenda.
     * PENDING_BANK: cliente indicou pagamento; aguarda confirmação no extrato / app M-Pesa.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.CONFIRMED;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        if (dataPagamento == null) {
            dataPagamento = LocalDate.now();
        }
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.CONFIRMED;
        }
    }

    public enum VerificationStatus {
        CONFIRMED,
        PENDING_BANK
    }
}
