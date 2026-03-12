package com.lirandzo.controller;

import com.lirandzo.entity.Viagem;
import com.lirandzo.service.ViagemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/viagens")
public class ViagemController {

    @Autowired
    private ViagemService viagemService;

    @GetMapping
    public ResponseEntity<List<Viagem>> getAllViagens() {
        return ResponseEntity.ok(viagemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Viagem> getViagemById(@PathVariable Long id) {
        return viagemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Viagem> createViagem(@Valid @RequestBody Viagem viagem) {
        Viagem saved = viagemService.save(viagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Viagem> updateViagem(@PathVariable Long id, @Valid @RequestBody Viagem viagem) {
        return viagemService.update(id, viagem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteViagem(@PathVariable Long id) {
        viagemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/motorista/{motoristaId}")
    public ResponseEntity<List<Viagem>> getViagensByMotorista(@PathVariable Long motoristaId) {
        return ResponseEntity.ok(viagemService.findByMotoristaId(motoristaId));
    }

    @GetMapping("/viatura/{viaturaId}")
    public ResponseEntity<List<Viagem>> getViagensByViatura(@PathVariable Long viaturaId) {
        return ResponseEntity.ok(viagemService.findByViaturaId(viaturaId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Viagem>> getViagensByStatus(@PathVariable Viagem.StatusViagem status) {
        return ResponseEntity.ok(viagemService.findByStatus(status));
    }
}
