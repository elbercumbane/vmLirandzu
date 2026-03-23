package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Encomenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_number")
    private Long numeroEncomenda;

    @NotNull(message = "Customer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"encomendas"})
    private Cliente cliente;

    @NotBlank(message = "Produto é obrigatório")
    @Column(name = "product", nullable = false, length = 200)
    private String produto;

    @NotBlank(message = "Origin is required")
    @Column(name = "origin", nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destination is required")
    @Column(name = "destination", nullable = false, length = 200)
    private String destino;

    @NotNull(message = "Total amount is required")
    @Column(name = "total_amount", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Column(name = "paid_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorPago = 0.0;

    @Column(name = "debt_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorDivida = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPagamento status = StatusPagamento.UNPAID;

    @Column(name = "order_date")
    private LocalDate dataEncomenda;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"encomenda"})
    private List<Pagamento> pagamentos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"encomendas"})
    private Viagem viagem;

    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quotation_id")
    @JsonIgnoreProperties({"cliente", "revisaoDe"})
    private Cotacao cotacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (dataEncomenda == null) {
            dataEncomenda = LocalDate.now();
        }
        calcularDivida();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
        calcularDivida();
    }

    private void calcularDivida() {
        if (valorTotal != null && valorPago != null) {
            valorDivida = Math.max(0.0, valorTotal - valorPago);
            if (valorDivida == 0.0 && valorPago >= valorTotal) {
                status = StatusPagamento.PAID;
            } else if (valorPago > 0.0 && valorDivida > 0.0) {
                status = StatusPagamento.PARTIAL;
            } else {
                status = StatusPagamento.UNPAID;
            }
        }
    }

    public enum StatusPagamento {
        PAID, PARTIAL, UNPAID
    }
}
