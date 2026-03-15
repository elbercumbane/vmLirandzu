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
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false, length = 200)
    private String nome;

    @Column(name = "phone", length = 50)
    private String telefone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", length = 200)
    private String endereco;

    @Column(name = "tax_id", length = 50)
    private String nif;

    @Column(name = "total_invoiced_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotalFaturado = 0.0;

    @Column(name = "debt_amount", columnDefinition = "DECIMAL(15,2)")
    private Double valorEmDivida = 0.0;

    @Column(name = "order_count")
    private Integer numeroEncomendas = 0;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
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
