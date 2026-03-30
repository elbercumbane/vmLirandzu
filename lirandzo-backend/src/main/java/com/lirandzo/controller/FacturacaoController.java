package com.lirandzo.controller;

import com.lirandzo.dto.EmitirFacturaCotacaoRequest;
import com.lirandzo.dto.EmitirFacturaResponse;
import com.lirandzo.service.FacturacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/facturacao")
public class FacturacaoController {

    @Autowired
    private FacturacaoService facturacaoService;

    @PostMapping("/cotacao/{cotacaoId}/emitir")
    public ResponseEntity<?> emitirFacturaDeCotacao(
            @PathVariable Long cotacaoId,
            @RequestBody(required = false) EmitirFacturaCotacaoRequest body) {
        try {
            var encomenda = facturacaoService.emitirFacturaDeCotacao(cotacaoId, body);
            EmitirFacturaResponse resposta = new EmitirFacturaResponse(
                    encomenda.getNumeroEncomenda(),
                    encomenda.getInvoiceNumber(),
                    encomenda.getInvoiceDate());
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
