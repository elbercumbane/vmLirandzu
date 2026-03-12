package com.lirandzo.service;

import com.lirandzo.entity.Viatura;
import com.lirandzo.repository.ViaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ViaturaService {

    @Autowired
    private ViaturaRepository viaturaRepository;

    public List<Viatura> findAll() {
        return viaturaRepository.findAll();
    }

    public Optional<Viatura> findById(Long id) {
        return viaturaRepository.findById(id);
    }

    public Viatura save(Viatura viatura) {
        return viaturaRepository.save(viatura);
    }

    public Optional<Viatura> update(Long id, Viatura viaturaAtualizada) {
        return viaturaRepository.findById(id)
                .map(viatura -> {
                    viatura.setMarca(viaturaAtualizada.getMarca());
                    viatura.setModelo(viaturaAtualizada.getModelo());
                    viatura.setMatricula(viaturaAtualizada.getMatricula());
                    viatura.setTipo(viaturaAtualizada.getTipo());
                    viatura.setCapacidade(viaturaAtualizada.getCapacidade());
                    viatura.setStatus(viaturaAtualizada.getStatus());
                    return viaturaRepository.save(viatura);
                });
    }

    public void deleteById(Long id) {
        viaturaRepository.deleteById(id);
    }

    public Optional<Viatura> findByMatricula(String matricula) {
        return viaturaRepository.findByMatricula(matricula);
    }

    public List<Viatura> findByStatus(Viatura.StatusViatura status) {
        return viaturaRepository.findByStatus(status);
    }

    public List<Viatura> findByTipo(String tipo) {
        return viaturaRepository.findByTipo(tipo);
    }
}
