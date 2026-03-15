package com.lirandzo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Viatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Brand is required")
    @Column(name = "brand", nullable = false, length = 100)
    private String marca;

    @NotBlank(message = "Model is required")
    @Column(name = "model", nullable = false, length = 100)
    private String modelo;

    @NotBlank(message = "License plate is required")
    @Column(name = "license_plate", nullable = false, length = 20, unique = true)
    private String matricula;

    @Column(name = "type", length = 50)
    private String tipo;

    @Column(name = "capacity", columnDefinition = "DECIMAL(10,2)")
    private Double capacidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusViatura status = StatusViatura.ACTIVE;

    @Column(name = "trip_count")
    private Integer numeroViagens = 0;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "viatura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Viagem> viagens = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum StatusViatura {
        ACTIVE, UNDER_MAINTENANCE, RESERVED, INACTIVE
    }
}
