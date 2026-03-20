package com.lirandzo.controller;

import com.lirandzo.dto.EncomendaDetalheDTO;
import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Encomenda.StatusPagamento;
import com.lirandzo.service.EncomendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/encomendas")
public class EncomendaController {

    @Autowired
    private EncomendaService encomendaService;

    @GetMapping
    public ResponseEntity<List<Encomenda>> getAllEncomendas(
            @RequestParam(required = false) StatusPagamento status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        List<Encomenda> encomendas = encomendaService.findAll(status, dataInicio, dataFim);
        return ResponseEntity.ok(encomendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EncomendaDetalheDTO> getEncomendaById(@PathVariable Long id) {
        return encomendaService.findById(id)
                .map(EncomendaDetalheDTO::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Encomenda> createEncomenda(@Valid @RequestBody Encomenda encomenda) {
        Encomenda saved = encomendaService.save(encomenda);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Encomenda> updateEncomenda(@PathVariable Long id, @Valid @RequestBody Encomenda encomenda) {
        return encomendaService.update(id, encomenda)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEncomenda(@PathVariable Long id) {
        encomendaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Encomenda>> getEncomendasByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(encomendaService.findByClienteId(clienteId));
    }

    @PostMapping("/{id}/pagamento")
    public ResponseEntity<Encomenda> adicionarPagamento(@PathVariable Long id, @RequestBody Double valor) {
        return encomendaService.adicionarPagamento(id, valor)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
