package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"viagens"})
    private Motorista motorista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @JsonIgnoreProperties({"viagens"})
    private Viatura viatura;

    @NotBlank(message = "Origin is required")
    @Column(name = "origin", nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destination is required")
    @Column(name = "destination", nullable = false, length = 200)
    private String destino;

    @Column(name = "departure_date")
    private LocalDate dataPartida;

    @Column(name = "expected_arrival_date")
    private LocalDate dataChegadaPrevista;

    @Column(name = "actual_arrival_date")
    private LocalDate dataChegadaReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusViagem status = StatusViagem.PLANNED;

    @Column(name = "fuel_consumed", columnDefinition = "DECIMAL(10,2)")
    private Double combustivelConsumido;

    @Column(name = "fuel_cost", columnDefinition = "DECIMAL(15,2)")
    private Double custoCombustivel;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Encomenda> encomendas = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum StatusViagem {
        PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
