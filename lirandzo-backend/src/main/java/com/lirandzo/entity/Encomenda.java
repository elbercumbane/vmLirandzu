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
@Table(name = "encomendas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Encomenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "numero_encomenda")
    private Long numeroEncomenda;

    @NotNull(message = "Cliente é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank(message = "Produto é obrigatório")
    @Column(nullable = false, length = 200)
    private String produto;

    @NotBlank(message = "Origem é obrigatória")
    @Column(nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destino é obrigatório")
    @Column(nullable = false, length = 200)
    private String destino;

    @NotNull(message = "Valor total é obrigatório")
    @Column(name = "valor_total", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Column(name = "valor_pago", columnDefinition = "DECIMAL(15,2)")
    private Double valorPago = 0.0;

    @Column(name = "valor_divida", columnDefinition = "DECIMAL(15,2)")
    private Double valorDivida = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPagamento status = StatusPagamento.NAO_PAGO;

    @Column(name = "data_encomenda")
    private LocalDate dataEncomenda;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"encomenda"})
    private List<Pagamento> pagamentos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id")
    @JsonIgnoreProperties({"encomendas"})
    private Viagem viagem;

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
                status = StatusPagamento.PAGO;
            } else if (valorPago > 0.0 && valorDivida > 0.0) {
                status = StatusPagamento.PARCIAL;
            } else {
                status = StatusPagamento.NAO_PAGO;
            }
        }
    }

    public enum StatusPagamento {
        PAGO, PARCIAL, NAO_PAGO
    }
}
