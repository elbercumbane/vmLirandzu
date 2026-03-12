package com.lirandzo.controller;

import com.lirandzo.entity.GuiaRemessa;
import com.lirandzo.entity.GuiaRemessa.StatusGuia;
import com.lirandzo.service.GuiaRemessaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guias-remessa")
public class GuiaRemessaController {

    @Autowired
    private GuiaRemessaService guiaRemessaService;

    @GetMapping
    public ResponseEntity<List<GuiaRemessa>> getAllGuiasRemessa(
            @RequestParam(required = false) StatusGuia status) {
        List<GuiaRemessa> guias = status != null 
            ? guiaRemessaService.findByStatus(status) 
            : guiaRemessaService.findAll();
        return ResponseEntity.ok(guias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuiaRemessa> getGuiaRemessaById(@PathVariable Long id) {
        return guiaRemessaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GuiaRemessa> createGuiaRemessa(@Valid @RequestBody GuiaRemessa guiaRemessa) {
        GuiaRemessa saved = guiaRemessaService.save(guiaRemessa);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuiaRemessa> updateGuiaRemessa(@PathVariable Long id, @Valid @RequestBody GuiaRemessa guiaRemessa) {
        return guiaRemessaService.update(id, guiaRemessa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuiaRemessa(@PathVariable Long id) {
        guiaRemessaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/motorista/{motoristaId}")
    public ResponseEntity<List<GuiaRemessa>> getGuiasByMotorista(@PathVariable Long motoristaId) {
        return ResponseEntity.ok(guiaRemessaService.findByMotoristaId(motoristaId));
    }

    @GetMapping("/viatura/{viaturaId}")
    public ResponseEntity<List<GuiaRemessa>> getGuiasByViatura(@PathVariable Long viaturaId) {
        return ResponseEntity.ok(guiaRemessaService.findByViaturaId(viaturaId));
    }
}
