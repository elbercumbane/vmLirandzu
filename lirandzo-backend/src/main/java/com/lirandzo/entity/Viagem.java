package com.lirandzo.entity;

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
@Table(name = "viagens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Motorista motorista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viatura_id")
    private Viatura viatura;

    @NotBlank(message = "Origem é obrigatória")
    @Column(nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destino é obrigatório")
    @Column(nullable = false, length = 200)
    private String destino;

    @Column(name = "data_partida")
    private LocalDate dataPartida;

    @Column(name = "data_chegada_prevista")
    private LocalDate dataChegadaPrevista;

    @Column(name = "data_chegada_real")
    private LocalDate dataChegadaReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusViagem status = StatusViagem.PLANEADA;

    @Column(name = "combustivel_consumido", columnDefinition = "DECIMAL(10,2)")
    private Double combustivelConsumido;

    @Column(name = "custo_combustivel", columnDefinition = "DECIMAL(15,2)")
    private Double custoCombustivel;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
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
        PLANEADA, EM_CURSO, CONCLUIDA, CANCELADA
    }
}
