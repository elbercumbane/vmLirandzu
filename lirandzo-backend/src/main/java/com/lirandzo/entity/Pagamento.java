package com.lirandzo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Encomenda é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encomenda_id", nullable = false)
    private Encomenda encomenda;

    @NotNull(message = "Valor é obrigatório")
    @Column(nullable = false, columnDefinition = "DECIMAL(15,2)")
    private Double valor;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(length = 100)
    private String referencia;

    @Column(length = 500)
    private String observacoes;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        if (dataPagamento == null) {
            dataPagamento = LocalDate.now();
        }
    }
}
