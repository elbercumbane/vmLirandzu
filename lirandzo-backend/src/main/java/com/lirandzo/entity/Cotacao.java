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

@Entity
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cotacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference", unique = true, length = 50)
    private String referencia;

    @NotNull(message = "Customer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Cliente cliente;

    @NotBlank(message = "Origin is required")
    @Column(name = "origin", nullable = false, length = 200)
    private String origem;

    @Column(name = "request_source", length = 50)
    private String fontePedido;

    @Column(name = "tipo_servico", length = 50)
    private String tipoServico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisao_de_id")
    private Cotacao revisaoDe;

    @Column(name = "revisao_numero")
    private Integer revisaoNumero;

    @NotBlank(message = "Destination is required")
    @Column(name = "destination", nullable = false, length = 200)
    private String destino;

    @Column(name = "vehicle_type", length = 100)
    private String tipoVeiculo;

    @Column(name = "cargo_description", length = 500)
    private String descricaoCarga;

    @Column(name = "total_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Column(name = "transport_cost", columnDefinition = "DECIMAL(15,2)")
    private Double custoTransporte;

    @Column(name = "collection_cost", columnDefinition = "DECIMAL(15,2)")
    private Double custoRecolha;

    @Column(name = "bill_of_entry_cost", columnDefinition = "DECIMAL(15,2)")
    private Double custoBillOfEntry;

    @Column(name = "quotation_date")
    private LocalDate dataCotacao;

    @Column(name = "validity_date")
    private LocalDate dataValidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCotacao status = StatusCotacao.PENDING;

    @Column(name = "notes", length = 500)
    private String observacoes;

    @Column(name = "terms", length = 500)
    private String condicoes;

    @Column(name = "operator", length = 200)
    private String operador;

    @Column(name = "preferred_delivery_method", length = 50)
    private String formaEnvioPreferida;

    @Column(name = "actual_delivery_method", length = 50)
    private String formaEnvioRealizada;

    @Column(name = "response_date")
    private LocalDateTime dataResposta;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        // Regra do sistema:
        // - Se vier do PORTAL (fontePedido=PORTAL), mantemos a data enviada/atribuída.
        // - Se for MANUAL (fontePedido nulo/outro), garantimos que a data é "hoje".
        boolean isPortal = "PORTAL".equalsIgnoreCase(fontePedido);
        if (!isPortal) {
            dataCotacao = LocalDate.now();
        } else if (dataCotacao == null) {
            dataCotacao = LocalDate.now();
        }

        // Validade sempre = dataCotacao + 3 dias (mesmo que o frontend não envie).
        dataValidade = dataCotacao.plusDays(3);
    }

    @PostPersist
    protected void onPostPersist() {
        if (referencia == null || referencia.isEmpty()) {
            referencia = "COT-" + LocalDate.now().getYear() + "-" + String.format("%04d", id);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum StatusCotacao {
        PENDING, RESPONDED, QUOTATION_GENERATED, EXPIRED, CANCELLED
    }
}
