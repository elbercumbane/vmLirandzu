package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 50)
    private String telefone;

    @Column(length = 100)
    private String email;

    @Column(length = 200)
    private String endereco;

    @Column(length = 50)
    private String nif;

    @Column(name = "valor_total_faturado", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotalFaturado = 0.0;

    @Column(name = "valor_em_divida", columnDefinition = "DECIMAL(15,2)")
    private Double valorEmDivida = 0.0;

    @Column(name = "numero_encomendas")
    private Integer numeroEncomendas = 0;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"cliente"})
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
}
