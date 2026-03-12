package com.lirandzo.controller;

import com.lirandzo.entity.Pagamento;
import com.lirandzo.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    @Autowired
    private PagamentoService pagamentoService;

    @GetMapping
    public ResponseEntity<List<Pagamento>> getAllPagamentos() {
        return ResponseEntity.ok(pagamentoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> getPagamentoById(@PathVariable Long id) {
        return pagamentoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pagamento> createPagamento(@Valid @RequestBody Pagamento pagamento) {
        Pagamento saved = pagamentoService.save(pagamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pagamento> updatePagamento(@PathVariable Long id, @Valid @RequestBody Pagamento pagamento) {
        return pagamentoService.update(id, pagamento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePagamento(@PathVariable Long id) {
        pagamentoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/encomenda/{encomendaId}")
    public ResponseEntity<List<Pagamento>> getPagamentosByEncomenda(@PathVariable Long encomendaId) {
        return ResponseEntity.ok(pagamentoService.findByEncomendaId(encomendaId));
    }
}
