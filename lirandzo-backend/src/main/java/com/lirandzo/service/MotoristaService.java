package com.lirandzo.service;

import com.lirandzo.entity.Motorista;
import com.lirandzo.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MotoristaService {

    @Autowired
    private MotoristaRepository motoristaRepository;

    public List<Motorista> findAll() {
        return motoristaRepository.findAll();
    }

    public Optional<Motorista> findById(Long id) {
        return motoristaRepository.findById(id);
    }

    public Motorista save(Motorista motorista) {
        return motoristaRepository.save(motorista);
    }

    public Optional<Motorista> update(Long id, Motorista motoristaAtualizado) {
        return motoristaRepository.findById(id)
                .map(motorista -> {
                    motorista.setNome(motoristaAtualizado.getNome());
                    motorista.setTelefone(motoristaAtualizado.getTelefone());
                    motorista.setNumeroCarta(motoristaAtualizado.getNumeroCarta());
                    motorista.setAvaliacaoMedia(motoristaAtualizado.getAvaliacaoMedia());
                    motorista.setStatus(motoristaAtualizado.getStatus());
                    return motoristaRepository.save(motorista);
                });
    }

    public void deleteById(Long id) {
        motoristaRepository.deleteById(id);
    }

    public List<Motorista> findByStatus(Motorista.StatusMotorista status) {
        return motoristaRepository.findByStatus(status);
    }

    public List<Motorista> searchByNome(String nome) {
        return motoristaRepository.findByNomeContainingIgnoreCase(nome);
    }
}
