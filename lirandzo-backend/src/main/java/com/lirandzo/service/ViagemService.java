package com.lirandzo.service;

import com.lirandzo.entity.Viagem;
import com.lirandzo.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ViagemService {

    @Autowired
    private ViagemRepository viagemRepository;

    public List<Viagem> findAll() {
        return viagemRepository.findAllWithRelations();
    }

    public Optional<Viagem> findById(Long id) {
        Optional<Viagem> viagem = viagemRepository.findById(id);
        // Ensure relationships are loaded
        viagem.ifPresent(v -> {
            if (v.getMotorista() != null) v.getMotorista().getId();
            if (v.getViatura() != null) v.getViatura().getId();
        });
        return viagem;
    }

    public Viagem save(Viagem viagem) {
        return viagemRepository.save(viagem);
    }

    public Optional<Viagem> update(Long id, Viagem viagemAtualizada) {
        return viagemRepository.findById(id)
                .map(viagem -> {
                    viagem.setMotorista(viagemAtualizada.getMotorista());
                    viagem.setViatura(viagemAtualizada.getViatura());
                    viagem.setOrigem(viagemAtualizada.getOrigem());
                    viagem.setDestino(viagemAtualizada.getDestino());
                    viagem.setDataPartida(viagemAtualizada.getDataPartida());
                    viagem.setDataChegadaPrevista(viagemAtualizada.getDataChegadaPrevista());
                    viagem.setDataChegadaReal(viagemAtualizada.getDataChegadaReal());
                    viagem.setStatus(viagemAtualizada.getStatus());
                    viagem.setCombustivelConsumido(viagemAtualizada.getCombustivelConsumido());
                    viagem.setCustoCombustivel(viagemAtualizada.getCustoCombustivel());
                    return viagemRepository.save(viagem);
                });
    }

    public void deleteById(Long id) {
        viagemRepository.deleteById(id);
    }

    public List<Viagem> findByMotoristaId(Long motoristaId) {
        return viagemRepository.findByMotoristaId(motoristaId);
    }

    public List<Viagem> findByViaturaId(Long viaturaId) {
        return viagemRepository.findByViaturaId(viaturaId);
    }

    public List<Viagem> findByStatus(Viagem.StatusViagem status) {
        return viagemRepository.findByStatus(status);
    }
}
