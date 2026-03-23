package com.lirandzo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_maintenance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Manutencao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Viatura viatura;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDate dataManutencao;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private TipoManutencao tipo;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 1000)
    private String descricao;

    @Column(name = "cost", columnDefinition = "DECIMAL(15,2)")
    private BigDecimal custo;

    @Column(name = "parts_replaced", length = 500)
    private String pecasSubstituidas;

    @Column(name = "workshop", length = 200)
    private String oficina;

    @Column(name = "km_reading")
    private Integer quilometragem;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusManutencao status = StatusManutencao.CONCLUIDA;

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

    public enum TipoManutencao {
        PREVENTIVA, CORRETIVA, INSPECAO, REVISAO
    }

    public enum StatusManutencao {
        AGENDADA, EM_CURSO, CONCLUIDA, ADIADA
    }
}
