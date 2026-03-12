package com.lirandzo.service;

import com.lirandzo.entity.*;
import com.lirandzo.entity.GuiaRemessa.StatusGuia;
import com.lirandzo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GuiaRemessaService {

    @Autowired
    private GuiaRemessaRepository guiaRemessaRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private EncomendaRepository encomendaRepository;
    
    @Autowired
    private MotoristaRepository motoristaRepository;
    
    @Autowired
    private ViaturaRepository viaturaRepository;
    
    @Autowired
    private ViagemRepository viagemRepository;

    public List<GuiaRemessa> findAll() {
        return guiaRemessaRepository.findAllWithRelations();
    }

    public Optional<GuiaRemessa> findById(Long id) {
        Optional<GuiaRemessa> guia = guiaRemessaRepository.findById(id);
        // Garantir que relacionamentos estão carregados
        guia.ifPresent(g -> {
            if (g.getMotorista() != null) g.getMotorista().getId();
            if (g.getViatura() != null) g.getViatura().getId();
            if (g.getViagem() != null) g.getViagem().getId();
            if (g.getItens() != null) {
                g.getItens().forEach(item -> {
                    if (item.getCliente() != null) item.getCliente().getId();
                    if (item.getEncomenda() != null) item.getEncomenda().getNumeroEncomenda();
                });
            }
        });
        return guia;
    }

    public GuiaRemessa save(GuiaRemessa guiaRemessa) {
        // Buscar e associar objetos relacionados
        if (guiaRemessa.getMotorista() != null && guiaRemessa.getMotorista().getId() != null) {
            motoristaRepository.findById(guiaRemessa.getMotorista().getId())
                .ifPresent(guiaRemessa::setMotorista);
        }
        
        if (guiaRemessa.getViatura() != null && guiaRemessa.getViatura().getId() != null) {
            viaturaRepository.findById(guiaRemessa.getViatura().getId())
                .ifPresent(guiaRemessa::setViatura);
        }
        
        if (guiaRemessa.getViagem() != null && guiaRemessa.getViagem().getId() != null) {
            viagemRepository.findById(guiaRemessa.getViagem().getId())
                .ifPresent(guiaRemessa::setViagem);
        }
        
        // Processar e associar itens
        if (guiaRemessa.getItens() != null && !guiaRemessa.getItens().isEmpty()) {
            guiaRemessa.getItens().forEach(item -> {
                item.setGuiaRemessa(guiaRemessa);
                
                // Buscar cliente se fornecido
                if (item.getCliente() != null && item.getCliente().getId() != null) {
                    clienteRepository.findById(item.getCliente().getId())
                        .ifPresent(item::setCliente);
                }
                
                // Buscar encomenda se fornecida
                if (item.getEncomenda() != null && item.getEncomenda().getNumeroEncomenda() != null) {
                    encomendaRepository.findById(item.getEncomenda().getNumeroEncomenda())
                        .ifPresent(item::setEncomenda);
                }
            });
        }
        
        GuiaRemessa saved = guiaRemessaRepository.save(guiaRemessa);
        
        // Gerar referência se não existir
        if (saved.getReferencia() == null || saved.getReferencia().isEmpty()) {
            saved.setReferencia("GR-" + LocalDate.now().getYear() + "-" + String.format("%04d", saved.getId()));
            saved = guiaRemessaRepository.save(saved);
        }
        
        // Calcular km percorridos
        if (saved.getKmSaida() != null && saved.getKmChegada() != null) {
            saved.setKmPercorridos(saved.getKmChegada() - saved.getKmSaida());
            saved = guiaRemessaRepository.save(saved);
        }
        
        return saved;
    }

    public Optional<GuiaRemessa> update(Long id, GuiaRemessa guiaAtualizada) {
        return guiaRemessaRepository.findById(id)
                .map(guia -> {
                    // Buscar e associar objetos relacionados
                    if (guiaAtualizada.getMotorista() != null && guiaAtualizada.getMotorista().getId() != null) {
                        motoristaRepository.findById(guiaAtualizada.getMotorista().getId())
                            .ifPresent(guia::setMotorista);
                    } else {
                        guia.setMotorista(null);
                    }
                    
                    if (guiaAtualizada.getViatura() != null && guiaAtualizada.getViatura().getId() != null) {
                        viaturaRepository.findById(guiaAtualizada.getViatura().getId())
                            .ifPresent(guia::setViatura);
                    } else {
                        guia.setViatura(null);
                    }
                    
                    if (guiaAtualizada.getViagem() != null && guiaAtualizada.getViagem().getId() != null) {
                        viagemRepository.findById(guiaAtualizada.getViagem().getId())
                            .ifPresent(guia::setViagem);
                    } else {
                        guia.setViagem(null);
                    }
                    
                    guia.setOrigem(guiaAtualizada.getOrigem());
                    guia.setDestino(guiaAtualizada.getDestino());
                    guia.setKmSaida(guiaAtualizada.getKmSaida());
                    guia.setKmChegada(guiaAtualizada.getKmChegada());
                    guia.setValorTotal(guiaAtualizada.getValorTotal());
                    guia.setStatus(guiaAtualizada.getStatus());
                    guia.setObservacoes(guiaAtualizada.getObservacoes());
                    guia.setDataGuia(guiaAtualizada.getDataGuia());
                    
                    // Atualizar itens
                    if (guiaAtualizada.getItens() != null) {
                        guia.getItens().clear();
                        guia.getItens().addAll(guiaAtualizada.getItens());
                        guia.getItens().forEach(item -> {
                            item.setGuiaRemessa(guia);
                            
                            // Buscar cliente se fornecido
                            if (item.getCliente() != null && item.getCliente().getId() != null) {
                                clienteRepository.findById(item.getCliente().getId())
                                    .ifPresent(item::setCliente);
                            }
                            
                            // Buscar encomenda se fornecida
                            if (item.getEncomenda() != null && item.getEncomenda().getNumeroEncomenda() != null) {
                                encomendaRepository.findById(item.getEncomenda().getNumeroEncomenda())
                                    .ifPresent(item::setEncomenda);
                            }
                        });
                    }
                    
                    // Calcular km percorridos
                    if (guia.getKmSaida() != null && guia.getKmChegada() != null) {
                        guia.setKmPercorridos(guia.getKmChegada() - guia.getKmSaida());
                    }
                    
                    return guiaRemessaRepository.save(guia);
                });
    }

    public void deleteById(Long id) {
        guiaRemessaRepository.deleteById(id);
    }

    public List<GuiaRemessa> findByStatus(StatusGuia status) {
        return guiaRemessaRepository.findByStatus(status);
    }

    public List<GuiaRemessa> findByMotoristaId(Long motoristaId) {
        return guiaRemessaRepository.findByMotoristaId(motoristaId);
    }

    public List<GuiaRemessa> findByViaturaId(Long viaturaId) {
        return guiaRemessaRepository.findByViaturaId(viaturaId);
    }
}
