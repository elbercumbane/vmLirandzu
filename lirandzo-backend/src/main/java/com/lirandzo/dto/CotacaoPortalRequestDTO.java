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
        String formaEnvioPreferida
) {
}

