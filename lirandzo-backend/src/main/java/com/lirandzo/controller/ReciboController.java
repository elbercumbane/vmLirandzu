package com.lirandzo.controller;

import com.lirandzo.entity.Recibo;
import com.lirandzo.service.ReciboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/recibos")
public class ReciboController {

    @Autowired
    private ReciboService reciboService;

    @GetMapping
    public ResponseEntity<List<Recibo>> listar() {
        return ResponseEntity.ok(reciboService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recibo> obter(@PathVariable Long id) {
        return reciboService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
