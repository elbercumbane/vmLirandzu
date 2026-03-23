package com.lirandzo.controller;

import com.lirandzo.dto.OcorrenciaRequestDTO;
import com.lirandzo.dto.OcorrenciaResponseDTO;
import com.lirandzo.service.OcorrenciaViaturaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/viaturas/ocorrencias")
public class OcorrenciaViaturaController {

    @Autowired
    private OcorrenciaViaturaService service;

    @GetMapping
    public ResponseEntity<List<OcorrenciaResponseDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OcorrenciaResponseDTO> obter(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/viatura/{vehicleId}")
    public ResponseEntity<List<OcorrenciaResponseDTO>> porViatura(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(service.findByVehicleId(vehicleId));
    }

    @GetMapping("/estado/{status}")
    public ResponseEntity<List<OcorrenciaResponseDTO>> porEstado(@PathVariable String status) {
        return ResponseEntity.ok(service.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<OcorrenciaResponseDTO> criar(@Valid @RequestBody OcorrenciaRequestDTO dto) {
        OcorrenciaResponseDTO saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OcorrenciaResponseDTO> actualizar(@PathVariable Long id,
                                                           @Valid @RequestBody OcorrenciaRequestDTO dto) {
        return service.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
