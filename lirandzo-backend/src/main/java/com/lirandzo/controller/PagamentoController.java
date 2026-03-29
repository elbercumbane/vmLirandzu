package com.lirandzo.controller;

import com.lirandzo.entity.Pagamento;
import com.lirandzo.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    @Autowired
    private PagamentoService pagamentoService;

    @GetMapping
    public ResponseEntity<List<Pagamento>> getAllPagamentos() {
        return ResponseEntity.ok(pagamentoService.findAll());
    }

    /** Pagamentos registados como "aguarda extrato" — fila de conciliação manual */
    @GetMapping("/pendentes-conciliacao")
    public ResponseEntity<List<Pagamento>> getPendentesConciliacao() {
        return ResponseEntity.ok(pagamentoService.findPendentesConciliacao());
    }

    /** Pagamentos registados por técnico — fila de aprovação gestor/admin */
    @GetMapping("/pendentes-aprovacao")
    public ResponseEntity<List<Pagamento>> getPendentesAprovacao() {
        return ResponseEntity.ok(pagamentoService.findPendentesAprovacaoGestor());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> getPagamentoById(@PathVariable Long id) {
        return pagamentoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPagamento(
            @Valid @RequestBody Pagamento pagamento,
            @RequestHeader(value = "X-Lirandzo-Role", required = false) String roleHeader) {
        try {
            Pagamento saved = pagamentoService.saveFromClientRequest(pagamento, roleHeader);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePagamento(@PathVariable Long id, @Valid @RequestBody Pagamento pagamento) {
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

    /** Após verificar no extrato bancário / M-Pesa que o valor entrou */
    @PostMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarConciliacao(@PathVariable Long id) {
        try {
            return pagamentoService.confirmarConciliacao(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Gestor/admin: aprovar pagamento registado pelo técnico */
    @PostMapping("/{id}/aprovar")
    public ResponseEntity<?> aprovarPagamentoGestor(@PathVariable Long id) {
        try {
            return pagamentoService.aprovarPagamentoGestor(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Gestor/admin: recusar pagamento (ex.: valor não reflectiu na conta) */
    @PostMapping("/{id}/recusar")
    public ResponseEntity<?> recusarPagamentoGestor(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String motivo = body != null ? body.get("motivo") : null;
            return pagamentoService.recusarPagamentoGestor(id, motivo)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
