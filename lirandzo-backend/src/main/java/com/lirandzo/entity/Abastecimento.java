package com.lirandzo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_refuels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Abastecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Viatura viatura;

    @Column(name = "refuel_date", nullable = false)
    private LocalDate dataAbastecimento;

    @Column(name = "liters", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal litros;

    @Column(name = "cost", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private BigDecimal custo;

    @Column(name = "km_reading")
    private Integer quilometragem;

    @Column(name = "station", length = 200)
    private String posto;

    @Column(name = "notes", length = 500)
    private String notas;

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
}
