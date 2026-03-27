package com.lirandzo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OcorrenciaResponseDTO(
    Long id,
    LocalDate occurrenceDate,
    Long vehicleId,
    String vehiclePlate,
    String vehicleName,
    Long driverId,
    String driverName,
    String type,
    String description,
    String severity,
    String status,
    String vehicleImpact,
    BigDecimal estimatedCost
) {}
