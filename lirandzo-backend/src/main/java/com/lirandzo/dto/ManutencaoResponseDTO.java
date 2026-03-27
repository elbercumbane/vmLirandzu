package com.lirandzo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ManutencaoResponseDTO(
    Long id,
    LocalDate maintenanceDate,
    Long vehicleId,
    String vehiclePlate,
    String vehicleName,
    String type,
    String description,
    BigDecimal cost,
    String partsReplaced,
    String workshop,
    Integer kmReading,
    String status
) {}
