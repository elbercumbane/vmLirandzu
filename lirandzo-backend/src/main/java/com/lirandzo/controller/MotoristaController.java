package com.lirandzo.controller;

import com.lirandzo.entity.Motorista;
import com.lirandzo.service.MotoristaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/motoristas")
public class MotoristaController {

    @Autowired
    private MotoristaService motoristaService;

    @GetMapping
    public ResponseEntity<List<Motorista>> getAllMotoristas() {
        return ResponseEntity.ok(motoristaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Motorista> getMotoristaById(@PathVariable Long id) {
        return motoristaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Motorista> createMotorista(@Valid @RequestBody Motorista motorista) {
        Motorista saved = motoristaService.save(motorista);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Motorista> updateMotorista(@PathVariable Long id, @Valid @RequestBody Motorista motorista) {
        return motoristaService.update(id, motorista)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMotorista(@PathVariable Long id) {
        motoristaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Motorista>> getMotoristasByStatus(@PathVariable Motorista.StatusMotorista status) {
        return ResponseEntity.ok(motoristaService.findByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Motorista>> searchMotoristas(@RequestParam String nome) {
        return ResponseEntity.ok(motoristaService.searchByNome(nome));
    }
}
