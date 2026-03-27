package com.lirandzo.controller;

import com.lirandzo.entity.Viatura;
import com.lirandzo.service.ViaturaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/viaturas")
public class ViaturaController {

    @Autowired
    private ViaturaService viaturaService;

    @GetMapping
    public ResponseEntity<List<Viatura>> getAllViaturas() {
        return ResponseEntity.ok(viaturaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Viatura> getViaturaById(@PathVariable Long id) {
        return viaturaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Viatura> createViatura(@Valid @RequestBody Viatura viatura) {
        Viatura saved = viaturaService.save(viatura);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Viatura> updateViatura(@PathVariable Long id, @Valid @RequestBody Viatura viatura) {
        return viaturaService.update(id, viatura)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteViatura(@PathVariable Long id) {
        viaturaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<Viatura> getViaturaByMatricula(@PathVariable String matricula) {
        return viaturaService.findByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Viatura>> getViaturasByStatus(@PathVariable Viatura.StatusViatura status) {
        return ResponseEntity.ok(viaturaService.findByStatus(status));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Viatura>> getViaturasByTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(viaturaService.findByTipo(tipo));
    }
}
