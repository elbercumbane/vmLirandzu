package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itens_guia_remessa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemGuiaRemessa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Guia de remessa é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guia_remessa_id", nullable = false)
    @JsonIgnoreProperties({"itens"})
    private GuiaRemessa guiaRemessa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties({"encomendas"})
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encomenda_id")
    @JsonIgnoreProperties({"cliente", "viagem", "pagamentos"})
    private Encomenda encomenda;

    @NotBlank(message = "Descrição é obrigatória")
    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false)
    private Integer quantidade = 1;

    @Column(length = 50)
    private String peso;

    @Column(length = 200)
    private String observacao;
}
