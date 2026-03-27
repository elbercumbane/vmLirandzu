package com.lirandzo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ManutencaoRequestDTO(
    @NotNull Long vehicleId,
    @NotNull LocalDate maintenanceDate,
    @NotBlank String type,
    @NotBlank String description,
    BigDecimal cost,
    String partsReplaced,
    String workshop,
    Integer kmReading,
    String status
) {}
