package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "delivery_note_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemGuiaRemessa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Delivery note is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_note_id", nullable = false)
    @JsonIgnoreProperties({"itens"})
    private GuiaRemessa guiaRemessa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"encomendas"})
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"cliente", "viagem", "pagamentos"})
    private Encomenda encomenda;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 500)
    private String descricao;

    @Column(name = "quantity", nullable = false)
    private Integer quantidade = 1;

    @Column(name = "weight", length = 50)
    private String peso;

    @Column(name = "note", length = 200)
    private String observacao;
}
