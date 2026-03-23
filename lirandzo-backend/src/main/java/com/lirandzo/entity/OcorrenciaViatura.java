package com.lirandzo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_occurrences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcorrenciaViatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Occurrence date is required")
    @Column(name = "occurrence_date", nullable = false)
    private LocalDate dataOcorrencia;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Viatura viatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Motorista motorista;  // quem conduzia / quem acidentou

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TipoOcorrencia tipo;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private Gravidade gravidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EstadoOcorrencia estado = EstadoOcorrencia.ABERTO;

    /** Estado da viatura após a ocorrência: operacional, em reparação ou perda total. Obrigatório para actualizar o status da viatura. */
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_impact", nullable = false, length = 20)
    private ImpactoVeiculo impactoVeiculo;

    @Column(name = "estimated_cost", columnDefinition = "DECIMAL(15,2)")
    private BigDecimal custoEstimado;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum TipoOcorrencia {
        AVARIA, ACIDENTE, MANUTENCAO
    }

    public enum Gravidade {
        BAIXA, MEDIA, ALTA, CRITICA
    }

    public enum EstadoOcorrencia {
        ABERTO, EM_REPARACAO, RESOLVIDO
    }

    /** Impacto na viatura: operacional (ainda circula), em reparação, ou perda total. */
    public enum ImpactoVeiculo {
        OPERACIONAL, EM_REPARACAO, PERDA_TOTAL
    }
}
