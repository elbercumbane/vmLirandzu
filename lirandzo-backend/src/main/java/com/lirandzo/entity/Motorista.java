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
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false, length = 200)
    private String nome;

    @Column(name = "phone", length = 50)
    private String telefone;

    @Column(name = "license_number", length = 50)
    private String numeroCarta;

    @Column(name = "average_rating", columnDefinition = "DECIMAL(3,2)")
    private Double avaliacaoMedia = 0.0;

    @Column(name = "trip_count")
    private Integer numeroViagens = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusMotorista status = StatusMotorista.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "motorista", cascade = CascadeType.ALL, orphanRemoval = true)
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

    public enum StatusMotorista {
        ACTIVE, INACTIVE
    }
}
