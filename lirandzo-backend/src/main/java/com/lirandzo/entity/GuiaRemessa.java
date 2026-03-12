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
@Table(name = "guias_remessa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuiaRemessa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String referencia;

    @Column(name = "data_guia")
    private LocalDate dataGuia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Motorista motorista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viatura_id")
    private Viatura viatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id")
    @JsonIgnoreProperties({"encomendas"})
    private Viagem viagem;

    @NotBlank(message = "Origem é obrigatória")
    @Column(nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destino é obrigatório")
    @Column(nullable = false, length = 200)
    private String destino;

    @Column(name = "km_saida")
    private Integer kmSaida;

    @Column(name = "km_chegada")
    private Integer kmChegada;

    @Column(name = "km_percorridos")
    private Integer kmPercorridos;

    @Column(name = "valor_total", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusGuia status = StatusGuia.PENDENTE;

    @Column(length = 500)
    private String observacoes;

    @OneToMany(mappedBy = "guiaRemessa", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"guiaRemessa"})
    private List<ItemGuiaRemessa> itens = new ArrayList<>();

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (dataGuia == null) {
            dataGuia = LocalDate.now();
        }
    }

    @PostPersist
    protected void onPostPersist() {
        if (referencia == null || referencia.isEmpty()) {
            referencia = "GR-" + LocalDate.now().getYear() + "-" + String.format("%04d", id);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
        if (kmSaida != null && kmChegada != null) {
            kmPercorridos = kmChegada - kmSaida;
        }
    }

    public enum StatusGuia {
        PENDENTE, EM_TRANSITO, ENTREGUE, CANCELADA
    }
}
