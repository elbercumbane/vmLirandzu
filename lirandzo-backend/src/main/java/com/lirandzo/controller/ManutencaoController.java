package com.lirandzo.controller;

import com.lirandzo.dto.ManutencaoRequestDTO;
import com.lirandzo.dto.ManutencaoResponseDTO;
import com.lirandzo.service.ManutencaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manutencao")
public class ManutencaoController {

    @Autowired
    private ManutencaoService service;

    @GetMapping
    public ResponseEntity<List<ManutencaoResponseDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManutencaoResponseDTO> obter(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/viatura/{vehicleId}")
    public ResponseEntity<List<ManutencaoResponseDTO>> porViatura(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(service.findByVehicleId(vehicleId));
    }

    @PostMapping
    public ResponseEntity<ManutencaoResponseDTO> criar(@Valid @RequestBody ManutencaoRequestDTO dto) {
        ManutencaoResponseDTO saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManutencaoResponseDTO> actualizar(@PathVariable Long id,
                                                            @Valid @RequestBody ManutencaoRequestDTO dto) {
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
