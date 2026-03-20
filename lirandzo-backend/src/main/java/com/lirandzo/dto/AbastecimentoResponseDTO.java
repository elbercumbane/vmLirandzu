package com.lirandzo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AbastecimentoResponseDTO(
    Long id,
    LocalDate refuelDate,
    Long vehicleId,
    String vehiclePlate,
    String vehicleName,
    BigDecimal liters,
    BigDecimal cost,
    Integer kmReading,
    String station,
    String notes
) {}
