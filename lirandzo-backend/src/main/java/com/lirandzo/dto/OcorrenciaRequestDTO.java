package com.lirandzo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OcorrenciaRequestDTO(
    @NotNull Long vehicleId,
    Long driverId,
    @NotNull LocalDate occurrenceDate,
    @NotBlank String type,
    @NotBlank String description,
    String vehicleImpact,  // OPERACIONAL, EM_REPARACAO, PERDA_TOTAL — obrigatório na criação, actualiza status da viatura
    String severity,
    String status,
    BigDecimal estimatedCost
) {}
