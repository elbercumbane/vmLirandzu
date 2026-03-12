package com.lirandzo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cotacoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cotacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String referencia;

    @NotNull(message = "Cliente é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank(message = "Origem é obrigatória")
    @Column(nullable = false, length = 200)
    private String origem;

    @NotBlank(message = "Destino é obrigatório")
    @Column(nullable = false, length = 200)
    private String destino;

    @Column(name = "tipo_veiculo", length = 100)
    private String tipoVeiculo;

    @Column(name = "descricao_carga", length = 500)
    private String descricaoCarga;

    @Column(name = "valor_total", columnDefinition = "DECIMAL(15,2)")
    private Double valorTotal;

    @Column(name = "custo_transporte", columnDefinition = "DECIMAL(15,2)")
    private Double custoTransporte;

    @Column(name = "custo_recolha", columnDefinition = "DECIMAL(15,2)")
    private Double custoRecolha;

    @Column(name = "custo_bill_of_entry", columnDefinition = "DECIMAL(15,2)")
    private Double custoBillOfEntry;

    @Column(name = "data_cotacao")
    private LocalDate dataCotacao;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCotacao status = StatusCotacao.PENDENTE;

    @Column(length = 500)
    private String observacoes;

    @Column(length = 500)
    private String condicoes;

    @Column(name = "operador", length = 200)
    private String operador;

    @Column(name = "data_resposta")
    private LocalDateTime dataResposta;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (dataCotacao == null) {
            dataCotacao = LocalDate.now();
        }
    }

    @PostPersist
    protected void onPostPersist() {
        if (referencia == null || referencia.isEmpty()) {
            referencia = "COT-" + LocalDate.now().getYear() + "-" + String.format("%04d", id);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum StatusCotacao {
        PENDENTE, RESPONDIDO, COTACAO_GERADA, EXPIRADA, CANCELADA
    }
}
