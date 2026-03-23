package com.lirandzo.controller;

import com.lirandzo.dto.AbastecimentoRequestDTO;
import com.lirandzo.dto.AbastecimentoResponseDTO;
import com.lirandzo.service.AbastecimentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/combustivel/abastecimentos")
public class AbastecimentoController {

    @Autowired
    private AbastecimentoService service;

    @GetMapping
    public ResponseEntity<List<AbastecimentoResponseDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AbastecimentoResponseDTO> obter(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/viatura/{vehicleId}")
    public ResponseEntity<List<AbastecimentoResponseDTO>> porViatura(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(service.findByVehicleId(vehicleId));
    }

    @PostMapping
    public ResponseEntity<AbastecimentoResponseDTO> criar(@Valid @RequestBody AbastecimentoRequestDTO dto) {
        AbastecimentoResponseDTO saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AbastecimentoResponseDTO> actualizar(@PathVariable Long id,
                                                               @Valid @RequestBody AbastecimentoRequestDTO dto) {
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
