package com.lirandzo.dto;

public record AuthResponseDTO(
        Long id,
        String nome,
        String email,
        String role
) {
}

