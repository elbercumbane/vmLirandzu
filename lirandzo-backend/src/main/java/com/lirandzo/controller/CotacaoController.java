package com.lirandzo.controller;

import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import com.lirandzo.service.CotacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cotacoes")
public class CotacaoController {

    @Autowired
    private CotacaoService cotacaoService;

    @GetMapping
    public ResponseEntity<List<Cotacao>> getAllCotacoes(
            @RequestParam(required = false) StatusCotacao status) {
        List<Cotacao> cotacoes = status != null 
            ? cotacaoService.findByStatus(status) 
            : cotacaoService.findAll();
        return ResponseEntity.ok(cotacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cotacao> getCotacaoById(@PathVariable Long id) {
        return cotacaoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cotacao> createCotacao(@Valid @RequestBody Cotacao cotacao) {
        Cotacao saved = cotacaoService.save(cotacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cotacao> updateCotacao(@PathVariable Long id, @Valid @RequestBody Cotacao cotacao) {
        return cotacaoService.update(id, cotacao)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCotacao(@PathVariable Long id) {
        cotacaoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Cotacao>> getCotacoesByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(cotacaoService.findByClienteId(clienteId));
    }
}
