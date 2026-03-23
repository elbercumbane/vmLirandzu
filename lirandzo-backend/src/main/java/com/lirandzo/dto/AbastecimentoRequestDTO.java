package com.lirandzo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AbastecimentoRequestDTO(
    @NotNull Long vehicleId,
    @NotNull LocalDate refuelDate,
    @NotNull @DecimalMin("0.01") BigDecimal liters,
    @NotNull @DecimalMin("0") BigDecimal cost,
    Integer kmReading,
    String station,
    String notes
) {}
