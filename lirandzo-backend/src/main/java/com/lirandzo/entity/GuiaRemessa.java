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
@Table(name = "delivery_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuiaRemessa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference", unique = true, length = 50)
    private String referencia;

    @Column(name = "note_date")
    private LocalDate dataGuia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Motorista motorista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Viatura viatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"encomendas"})
    private Viagem viagem;

    @NotBlank(message = "Origin is required")
    @Column(name = "origin", nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destination is required")
    @Column(name = "destination", nullable = false, length = 200)
    private String destino;

    @Column(name = "departure_km")
    private Integer kmSaida;

    @Column(name = "arrival_km")
    private Integer kmChegada;

    @Column(name = "distance_km")
    private Integer kmPercorridos;

    @Column(name = "total_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusGuia status = StatusGuia.PENDING;

    @Column(name = "notes", length = 500)
    private String observacoes;

    @OneToMany(mappedBy = "guiaRemessa", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"guiaRemessa"})
    private List<ItemGuiaRemessa> itens = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
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
        PENDING, IN_TRANSIT, DELIVERED, CANCELLED
    }
}
