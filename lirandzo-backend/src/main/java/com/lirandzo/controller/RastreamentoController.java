package com.lirandzo.controller;

import com.lirandzo.dto.RastreamentoTimelineDTO;
import com.lirandzo.service.RastreamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rastreamento")
public class RastreamentoController {

    @Autowired
    private RastreamentoService rastreamentoService;

    /**
     * Linha temporal interna (facturação): cotação → factura → pagamentos → viagem.
     * O portal público não usa este endpoint por agora (rastreio por código virá depois).
     */
    @GetMapping("/encomenda/{numero}")
    public ResponseEntity<RastreamentoTimelineDTO> timelinePorEncomenda(@PathVariable Long numero) {
        return rastreamentoService.obterTimeline(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
