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
@Table(name = "viaturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Viatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Marca é obrigatória")
    @Column(nullable = false, length = 100)
    private String marca;

    @NotBlank(message = "Modelo é obrigatório")
    @Column(nullable = false, length = 100)
    private String modelo;

    @NotBlank(message = "Matrícula é obrigatória")
    @Column(nullable = false, length = 20, unique = true)
    private String matricula;

    @Column(length = 50)
    private String tipo;

    @Column(columnDefinition = "DECIMAL(10,2)")
    private Double capacidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusViatura status = StatusViatura.ATIVA;

    @Column(name = "numero_viagens")
    private Integer numeroViagens = 0;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
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
        ATIVA, EM_MANUTENCAO, RESERVADA, INATIVA
    }
}
