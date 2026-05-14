package com.lirandzo.dto;

public record CotacaoPortalRequestDTO(
        String nome,
        String email,
        String telefone1,
        Boolean hasWhatsApp1,
        String telefone2,
        Boolean hasWhatsApp2,
        String origem,
        String destino,
        String mensagem,
        String formaEnvioPreferida,
        String tipoServico,
        /** Opcional: TOTALIDADE | ADIANTADO_TOTAL | DUAS_PRESTACOES | PARCIAL */
        String condicaoPagamento,
        /** Opcional: NUIT / contribuinte */
        String nuit,
        String endereco,
        String provincia,
        String pessoaContacto
) {
    public CotacaoPortalRequestDTO {
        if (condicaoPagamento != null) {
            condicaoPagamento = condicaoPagamento.trim();
        }
    }
}

